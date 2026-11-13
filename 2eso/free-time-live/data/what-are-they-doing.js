/* 2 ESO · LS2 Free Time, Live! · Learning Path 2 · What are they doing? (Present Continuous; reading log = LS criterion 4.1) */
window.LP = {
  key: 'ls2Doing2ESO', n: 2, starter: true, title: 'What are they doing?',
  panels: [
    { id: 'recall', type: 'recall', tab: 'Recall', title: { ca: 'Recall: Learning Path 1', en: 'Recall: Learning Path 1' }, pill: { ca: 'Sense apunts', en: 'No notes' },
      intro: { ca: 'Escriu les respostes sense mirar res.', en: 'Type the answers without looking.' },
      items: [
        { q: 'I ___ football on Saturdays. (jugar)', a: ['play'] },
        { q: 'We go ___ at the skate park. (patinar)', a: ['skating'] },
        { q: 'She ___ karate twice a week. (fer)', a: ['does'] },
        { q: 'I ___ to music on the bus. (escoltar)', a: ['listen'] },
        { r: 'insecure', q: 'He ___ (not / like) video games.', a: ["doesn't like", 'does not like'] },
        { r: 'insecure', q: '___ you play the piano? — No, I don’t.', a: ['do'] },
        { q: 'I read ___ at night: Mortadelo, Astérix… (còmics)', a: ['comics'] },
        { r: 'safe', q: 'I go cycling ___ a week: on Saturday and Sunday.', a: ['twice'] },
        { r: 'safe', q: 'I meet my friends ___ the weekend.', a: ['at'] },
        { r: 'daring', q: 'She is very good ___ drawing.', a: ['at'] },
        { r: 'daring', q: 'I ___ a lot of time playing the guitar. (passar)', a: ['spend'] }
      ] },
    { id: 'vocab', type: 'vocab', practiceMode: 'listen', tab: { ca: 'Vocabulari', en: 'Vocabulary' }, title: { ca: 'Roba, equipament i temps', en: 'Clothes, kit and weather' },
      intro: { ca: 'Explora, practica amb les targetes i completa les frases.', en: 'Explore, practise with the cards and complete the sentences.' },
      receptive: 'crowd · half-time · highlights',
      core: { beginners: ['T-shirt', 'trainers', 'shorts', 'cap', 'It’s sunny', 'It’s cold', 'It’s hot', 'It’s raining'], insecure: ['T-shirt', 'trainers', 'tracksuit', 'shorts', 'cap', 'helmet', 'wear a uniform', 'wear a costume', 'It’s sunny', 'It’s cloudy', 'It’s windy', 'It’s cold', 'It’s hot', 'It’s raining', 'It’s snowing'], safe: ['T-shirt', 'trainers', 'tracksuit', 'shorts', 'helmet', 'wear a uniform', 'It’s sunny', 'It’s cold', 'It’s raining', 'It’s snowing', 'a concert', 'a match', 'a competition', 'a tournament', 'win / lose a match', 'score a goal', 'foggy', 'freezing', 'What’s the weather like?', 'degrees'], daring: ['trainers', 'tracksuit', 'helmet', 'wear a uniform', 'It’s raining', 'It’s snowing', 'a match', 'a competition', 'a tournament', 'win / lose a match', 'score a goal', 'freezing', 'What’s the weather like?', 'degrees', 'the crowd', 'cheer', 'warm up', 'take part in'] },
      /* How it works for the structures in these words (Roger, 13 Nov 2026: "Also vocab structures like prepositions"): shown under
         Explore on the Vocabulary step and in the 📓 notebook. Same visual helpers as the Grammar step. */
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
          { ca: head('☀️', 'El temps: <em>It’s</em> + adjectiu', 'En anglès el temps sempre comença amb <b>It’s</b> (“fa”, “està”).') +
              row(card('amber', 'nom → adjectiu: + y', ex('sun → sun<b>ny</b> → <b>It’s sunny</b>.', 'fa sol') + ex('cloud → cloud<b>y</b> → <b>It’s cloudy</b>.', 'està ennuvolat') + ex('wind → wind<b>y</b> → <b>It’s windy</b>.', 'fa vent'), 220),
                card('blue', '🌡 fred i calor', ex('<b>It’s cold</b>.', 'fa fred') + ex('<b>It’s hot</b>.', 'fa calor'), 180),
                card('purple', '🌧 ara mateix: -ing', ex('<b>It’s raining</b>.', 'plou') + ex('<b>It’s snowing</b>.', 'neva'), 180)) +
              mistakes('Compte!', bad('Is sunny.', '<b>It’s</b> sunny.', '(sempre amb It)'), bad('It’s sun.', 'It’s <b>sunny</b>.'), bad('It makes cold.', 'It’s <b>cold</b>.', '(no “makes”)')) +
              together(true, ['☀️ It’s ___ · 💨 It’s ___ · ☁️ It’s ___', 'sunny · windy · cloudy']) +
              turn('Ara tu:', 'quin temps fa avui? I què portes posat? <em>It’s… I’m wearing…</em>'),
            en: head('☀️', 'The weather: <em>It’s</em> + adjective', 'In English, the weather always starts with <b>It’s</b>.') +
              row(card('amber', 'noun → adjective: + y', ex('sun → sun<b>ny</b> → <b>It’s sunny</b>.') + ex('cloud → cloud<b>y</b> → <b>It’s cloudy</b>.') + ex('wind → wind<b>y</b> → <b>It’s windy</b>.'), 220),
                card('blue', '🌡 cold and hot', ex('<b>It’s cold</b>.') + ex('<b>It’s hot</b>.'), 180),
                card('purple', '🌧 right now: -ing', ex('<b>It’s raining</b>.') + ex('<b>It’s snowing</b>.'), 180)) +
              mistakes('Watch out', bad('Is sunny.', '<b>It’s</b> sunny.', '(always with It)'), bad('It’s sun.', 'It’s <b>sunny</b>.'), bad('It makes cold.', 'It’s <b>cold</b>.')) +
              together(false, ['☀️ It’s ___ · 💨 It’s ___ · ☁️ It’s ___', 'sunny · windy · cloudy']) +
              turn('Your turn:', 'what’s the weather like today? And what are you wearing? <em>It’s… I’m wearing…</em>') },
          { ca: head('👕', 'Roba: <em>wear</em> i l’ordre de les paraules', 'El color va <b>davant</b> de la peça de roba.') +
              row(card('green', '🎨 color + roba', ex('a <b>red</b> T-shirt', 'una samarreta vermella') + ex('<b>blue</b> shorts') + ex('new trainers')),
                card('blue', '👀 wear = portar posat', ex('He’s <b>wearing</b> a red T-shirt.') + ex('We <b>wear</b> a uniform at school.') + ex('She’s <b>wearing</b> a costume.'))) +
              mistakes('Compte!', bad('a T-shirt red', 'a <b>red</b> T-shirt'), bad('He’s carrying a cap.', 'He’s <b>wearing</b> a cap.', '(a sobre del cos → wear)')) +
              together(true, ['Order: T-shirt / a / green → He’s wearing ___.', 'a green T-shirt']) +
              turn('Ara tu:', 'descriu què porta posat un company: <em>He’s / She’s wearing…</em>'),
            en: head('👕', 'Clothes: <em>wear</em> and word order', 'The colour goes <b>before</b> the clothes.') +
              row(card('green', '🎨 colour + clothes', ex('a <b>red</b> T-shirt') + ex('<b>blue</b> shorts') + ex('new trainers')),
                card('blue', '👀 wear', ex('He’s <b>wearing</b> a red T-shirt.') + ex('We <b>wear</b> a uniform at school.') + ex('She’s <b>wearing</b> a costume.'))) +
              mistakes('Watch out', bad('a T-shirt red', 'a <b>red</b> T-shirt'), bad('He’s carrying a cap.', 'He’s <b>wearing</b> a cap.', '(on your body → wear)')) +
              together(false, ['Order: T-shirt / a / green → He’s wearing ___.', 'a green T-shirt']) +
              turn('Your turn:', 'describe what a classmate is wearing: <em>He’s / She’s wearing…</em>') },
          { r: 'safe', en: head('🏟', 'Events and more weather', 'Words that go together.') +
              row(card('blue', 'Events', ex('<b>go to</b> a concert · a match · a festival') + ex('<b>win / lose</b> a match') + ex('<b>score</b> a goal') + ex('<b>take part in</b> a competition', 'Daring')),
                card('purple', 'More weather', ex('<b>What’s the weather like?</b> — It’s foggy.') + ex('It’s <b>freezing</b>! Minus two <b>degrees</b>.') + ex('It’s <b>stormy</b>, so the fair is closed.'))) +
              mistakes('Watch out', bad('win the other team', '<b>beat</b> the other team / <b>win</b> the match'), bad('How is the weather like?', '<b>What’s</b> the weather like?')) +
              together(false, ['___ the weather like?', 'What’s']) +
              turn('Your turn:', 'tell your partner about an event you went to: where, the weather and who won.') }
        ];
      })(),
      groups: [
        { g: 'Clothes & kit', items: [['T-shirt', 'samarreta', 'He’s wearing a red T-shirt.'], ['trainers', 'bambes', 'I need new trainers for running.'], ['tracksuit', 'xandall', 'She’s wearing a blue tracksuit.'], ['shorts', 'pantalons curts', 'They’re playing in shorts.'], ['cap', 'gorra', 'Put on a cap: it’s sunny.'], ['helmet', 'casc', 'Always wear a helmet on your bike.'], ['wear a uniform', 'portar uniforme', 'The team wears a white uniform.'], ['wear a costume', 'portar una disfressa', 'At the fair, people wear costumes.']] },
        { g: 'Weather', items: [['It’s sunny', 'fa sol', 'It’s sunny, so we’re at the beach.'], ['It’s cloudy', 'està ennuvolat', 'It’s cloudy but it isn’t cold.'], ['It’s windy', 'fa vent', 'It’s windy: perfect for kites.'], ['It’s cold', 'fa fred', 'It’s cold. Wear a jacket.'], ['It’s hot', 'fa calor', 'It’s hot today: 30 degrees!'], ['It’s raining', 'plou', 'It’s raining, so the match is cancelled.'], ['It’s snowing', 'neva', 'Look! It’s snowing!']] },
        { r: 'safe', g: 'Events (Safe)', items: [['a concert', 'un concert', 'We’re going to a concert tonight.'], ['a match', 'un partit', 'The match starts at six.'], ['a festival', 'un festival', 'There is a music festival in July.'], ['a competition', 'una competició', 'She’s in a dance competition.'], ['a tournament', 'un torneig', 'Our team is playing in a tournament.'], ['a show', 'un espectacle', 'The show starts at eight.'], ['a fair', 'una fira', 'The town fair is this weekend.'], ['win / lose a match', 'guanyar / perdre un partit', 'We usually win, but today we’re losing!'], ['score a goal', 'marcar un gol', 'Marc is scoring a lot of goals this season.']] },
        { r: 'safe', g: 'More weather (Safe)', items: [['foggy', 'hi ha boira', 'It’s foggy this morning.'], ['stormy', 'hi ha tempesta', 'It’s stormy, so the fair is closed.'], ['freezing', 'gèlid', 'It’s freezing! Minus two degrees.'], ['What’s the weather like?', 'Quin temps fa?', 'What’s the weather like in Girona today?'], ['degrees', 'graus', 'It’s 25 degrees.']] },
        { r: 'daring', g: 'At the event (Daring)', items: [['the crowd', 'el públic', 'The crowd is cheering.'], ['cheer', 'animar', 'The fans are cheering for the team.'], ['warm up', 'escalfar', 'The players are warming up.'], ['take part in', 'participar en', 'Twenty teams are taking part in the tournament.']] }
      ],
      review: [
        { g: 'Learning Path 1', items: [['go skating', 'anar a patinar', 'They go skating at the skate park.'], ['do gymnastics', 'fer gimnàstica', 'She does gymnastics at a club.'], ['meet friends', 'quedar amb amics', 'I meet friends on Saturdays.'], ['draw', 'dibuixar', 'She draws comics.']] },
        { r: 'safe', g: 'Learning Path 1', items: [['twice a week', 'dos cops per setmana', 'We train twice a week.']] }
      ],
      practice: [
        { r: 'insecure', q: 'It’s cold and it’s raining. Take an umbrella and wear a ___. (jaqueta)', a: ['jacket'] },
        { q: 'On your bike, always wear a ___. (casc)', a: ['helmet'] },
        { q: 'It’s 32 degrees. It’s very ___. (calor)', a: ['hot'] },
        { q: 'I run in my new ___. (bambes)', a: ['trainers'] },
        { q: 'Look at the sky! It’s ___: white and cold. (nevar)', a: ['snowing'] },
        { q: 'Put on a ___: the sun is strong. (gorra)', a: ['cap'] },
        { q: 'It’s ___ today: the clouds are grey. (ennuvolat)', a: ['cloudy'] },
        { r: 'insecure', q: 'The football team wears a blue ___. (uniforme)', a: ['uniform'] },
        { r: 'insecure', q: 'In summer we play in ___, not in long trousers. (pantalons curts)', a: ['shorts'] },
        { r: 'insecure', q: 'It’s ___: look at the trees moving! (vent)', a: ['windy'] },
        { r: 'safe', q: 'Our team is in a basketball ___ with 12 teams this weekend.', a: ['tournament'] },
        { r: 'safe', q: 'It’s ___: I can’t see the end of the street.', a: ['foggy'] },
        { r: 'safe', q: '___ the weather like today? — It’s sunny.', a: ["what's", 'what is'] },
        { r: 'safe', q: 'Marc is a great player: he ___ a goal in every match.', a: ['scores'] },
        { r: 'daring', q: 'The ___ is cheering: 500 people!', a: ['crowd'] },
        { r: 'daring', q: 'Before the match, the players ___ up for ten minutes.', a: ['warm'] }
      ] },
    { id: 'read', type: 'mc', tab: 'Reading', title: 'Reading: A post and a web page', pill: { ca: 'Respon-ho tot', en: 'Answer all' },
      intro: { ca: 'Llegeix un post d’un club i una pàgina web d’un esdeveniment. Després respon.', en: 'Read a post from a club and an event web page. Then answer.' },
      media: { text: {
        beginners: '<p><strong>Text A · Post · Climb Up Club, Saturday 14 November, 11:05</strong><br>Live from the climbing wall! 🧗 Today our climbers are training for a competition. Nil is climbing the red route. His friends are cheering. It’s cold outside, but it’s warm inside. We usually train on Saturday mornings. Come and try! First class free.</p><p><strong>Text B · Web page · Autumn Fun Run</strong><br><strong>Sunday 22 November · 10:00 · Parc Central</strong><br>Run 3 km with your family and friends! Every runner gets a T-shirt and a medal. 🏅 Tickets: 5 euros. Sign up now: only 200 places!</p><p class="tiny"><strong>Paraules:</strong> climbing wall = rocòdrom · training = entrenant · cheering = animant · outside / inside = fora / dins · runner = corredor/a · sign up = apunta’t</p>',
        insecure: '<p><strong>Text A · Post · Climb Up Club, Saturday 14 November, 11:05</strong><br>Live from the climbing wall! 🧗 Today our young climbers are training for the regional competition. Nil is climbing the red route and his friends are cheering. It’s cold outside, but it’s warm inside. We usually train on Saturday mornings. Come and try! First class free.</p><p><strong>Text B · Web page · Autumn Fun Run</strong><br><strong>Sunday 22 November · 10:00 · Parc Central</strong><br>Run 3 km with your family and friends! Every runner gets a T-shirt and a medal. 🏅 Tickets: 5 euros (children under 6: free). There is a food market after the run. Sign up now: only 200 places!</p>',
        safe: '<p><strong>Text A · Post · Climb Up Club, Saturday 14 November, 11:05</strong><br>Live from the climbing wall! 🧗 Today our young climbers are training for the regional competition. Nil is climbing the red route, the hardest one, and his friends are cheering. It’s cold and windy outside, but it’s nice and warm inside. We usually train on Saturday mornings from ten to twelve, and we always finish with a game. Do you want to try? Your first class is free: just send us a message.</p><p><strong>Text B · Web page · Autumn Fun Run</strong><br><strong>Sunday 22 November · 10:00 · Parc Central</strong><br>Run or walk 3 km with your family and friends! Every runner gets a T-shirt and a medal 🏅, and there is a food market with hot chocolate after the run. Tickets: 5 euros (children under 6: free). The money goes to the local animal shelter. Sign up now: there are only 200 places and they are selling fast!</p>',
        daring: '<p><strong>Text A · Post · Climb Up Club, Saturday 14 November, 11:05</strong><br>Live from the climbing wall! 🧗 Today our young climbers are training for the regional competition next month. Nil is climbing the red route, the hardest one on the wall, and his friends are cheering him on from the mats. It’s cold and windy outside, but it’s nice and warm inside. We usually train on Saturday mornings from ten to twelve, and we always finish with a game, because climbing is also about having fun. Do you want to try? Your first class is free: just send us a message and bring comfortable clothes.</p><p><strong>Text B · Web page · Autumn Fun Run</strong><br><strong>Sunday 22 November · 10:00 · Parc Central</strong><br>Run or walk 3 km with your family and friends! Every runner gets a T-shirt and a medal 🏅, and there is a food market with hot chocolate after the run. Tickets: 5 euros (children under 6: free). All the money goes to the local animal shelter, so you are running for a good cause. Sign up now: there are only 200 places and they are selling fast!</p>'
      } },
      items: [
        { q: 'What are the young climbers doing today?', o: ['training for a competition', 'running 3 km', 'watching a match'], h: 'Mira la segona frase del text A.' },
        { q: 'What is Nil doing?', o: ['climbing the red route', 'cheering', 'taking photos'], h: 'Busca “Nil is…”.' },
        { q: 'What is the weather like outside the climbing wall?', o: ['cold', 'hot', 'sunny'], h: 'Busca “outside”.' },
        { q: 'When does the club usually train?', o: ['on Saturday mornings', 'on Sunday mornings', 'every day'], h: 'Busca “usually”.' },
        { q: 'When is the Fun Run?', o: ['on Sunday 22 November at 10:00', 'on Saturday 14 November at 11:05', 'on Sunday at 5:00'], h: 'Mira el títol del text B.' },
        { r: 'insecure', q: 'What does every runner get?', o: ['a T-shirt and a medal', 'hot chocolate', 'a cap'], h: 'Busca “Every runner gets…”.' },
        { r: 'insecure', q: 'Why does text B say “Sign up now”?', o: ['It wants you to buy a ticket.', 'It gives information about the weather.', 'It tells you what Nil is doing.'], h: 'Pensa: què vol el text B de tu?' },
        { r: 'safe', q: 'How does the club always finish the training?', o: ['with a game', 'with a competition', 'with hot chocolate'] },
        { r: 'safe', q: 'Where does the money from the tickets go?', o: ['to the local animal shelter', 'to the climbing club', 'to the food market'] },
        { r: 'daring', q: 'Why does the club say “climbing is also about having fun”?', o: ['to explain why they always finish with a game', 'to say that training is not important', 'to describe the red route'] },
        { r: 'daring', q: '“They are selling fast” means…', o: ['many people are buying tickets now', 'the tickets are cheap', 'the run is fast'] }
      ] },
    // LS criterion 4.1: a reading log on two posts or web pages: what people are doing, where and when, what they usually do, and the purpose (inform, invite, sell).
    { id: 'log', type: 'step', tab: { ca: 'Registre de lectura', en: 'Reading log' }, title: { ca: 'Registre de lectura: els dos textos', en: 'Reading log: the two texts' }, pill: { ca: 'Ho veu el professor', en: 'Your teacher sees it' },
      intro: { ca: 'Torna a llegir els dos textos i omple el registre amb notes curtes <strong>en anglès</strong> (paraules clau, no frases copiades). Les preguntes estan en català per ajudar-te, però <strong>escriu les respostes en anglès</strong>. El professor el veu al seu tauler.', en: 'Read the two texts again and fill in the log with short notes <strong>in English</strong> (key words, not copied sentences). Your teacher sees it on the dashboard.' },
      html: { ca: '<div class="model"><strong>Propòsit:</strong> <em>to inform</em> (informar: explica què passa) · <em>to invite</em> (convidar: vol que hi vagis o ho provis) · <em>to sell</em> (vendre: vol que compris alguna cosa). Un text pot tenir dos propòsits.<br><strong>Exemple de nota en anglès:</strong> <em>to invite · “Come and try!”</em></div>', en: '<div class="model"><strong>Purpose:</strong> <em>to inform</em> (it tells you what is happening) · <em>to invite</em> (it wants you to come or try) · <em>to sell</em> (it wants you to buy something). A text can have two purposes.<br><strong>Example note:</strong> <em>to invite · “Come and try!”</em></div>' },
      fields: [
        { id: 'a1', label: { ca: 'Text A: què està fent la gent ara? (dues coses)', en: 'Text A: what are people doing now? (two things)' }, ph: 'They are …ing … · He is …ing …', rows: 2 },
        { id: 'a2', label: { ca: 'Text A: on i quan', en: 'Text A: where and when' }, ph: 'At the … · on …', rows: 1 },
        { id: 'a3', label: { ca: 'Text A: què fan normalment?', en: 'Text A: what do they usually do?' }, ph: 'They usually …', rows: 1 },
        { r: 'insecure', id: 'a4', label: { ca: 'Text A: propòsit (to inform / to invite / to sell) i una paraula del text que ho mostra', en: 'Text A: purpose (to inform / to invite / to sell) and one word from the text that shows it' }, ph: 'To … · “…”', rows: 2 },
        { r: 'insecure', id: 'b1', label: { ca: 'Text B: què farà la gent? (dues coses)', en: 'Text B: what will people do there? (two things)' }, ph: 'People can … · They get …', rows: 2 },
        { id: 'b2', label: { ca: 'Text B: on i quan', en: 'Text B: where and when' }, ph: 'In … · on … at …', rows: 1 },
        { r: 'insecure', id: 'b4', label: { ca: 'Text B: propòsit (to inform / to invite / to sell) i una paraula del text que ho mostra', en: 'Text B: purpose (to inform / to invite / to sell) and one word from the text that shows it' }, ph: 'To … · “…”', rows: 2 },
        { r: 'safe', id: 'word', label: 'A word you did not know in text A or B: what does it mean, and how did the context help you?', ph: '“…” means … · The clue is …', rows: 2 },
        { r: 'daring', id: 'cmp', label: 'Compare the two texts: how is the language of a post different from the language of a web page that sells something?', ph: 'The post is … · The web page …', rows: 2 }
      ],
      rate: {
        beginners: ['He escrit notes curtes en anglès, no frases copiades', 'Sé què fa la gent ara i què fa normalment al text A', 'Sé on i quan passa cada text'],
        insecure: ['He escrit notes curtes en anglès, no frases copiades', 'Sé què fa la gent ara i què fa normalment al text A', 'He dit el propòsit de cada text amb una paraula que ho mostra'],
        safe: ['I wrote short notes in English, in my own words', 'I noted what people are doing and what they usually do', 'I gave the purpose of each text with evidence from the text', 'I worked out a new word from its context'],
        daring: ['I wrote short notes in English, in my own words', 'I noted what people are doing and what they usually do', 'I gave the purpose of each text with precise evidence', 'I compared how the two texts use language']
      } },
    { id: 'listen', type: 'mc', tab: 'Listening', title: 'Listening: Live from the sports hall', pill: { ca: 'Àudio', en: 'Audio' },
      intro: { ca: 'L’Emma i el Sam retransmeten en directe un partit de bàsquet de l’escola. Escolta una vegada per saber qui guanya. Després llegeix les preguntes i torna a escoltar.', en: 'Emma and Sam are reporting live from a school basketball match. Listen once to find out who is winning. Then read the questions and listen again.' },
      media: { audio: 'audio/live-from-the-sports-hall.mp3', title: 'Live from the sports hall (Emma and Sam)', script: [
        ['Emma', '[excited] Hello and welcome to School Radio! We’re at the sports hall and the big match is starting: the Blue Team against the Green Team. Sam, what’s happening?'],
        ['Sam', 'Well, Emma, the Blue Team is wearing their new white uniform and the Green Team is wearing green T-shirts and black shorts. The players are warming up and the crowd is cheering. It’s very noisy in here!'],
        ['Emma', 'It’s cold and rainy outside, but inside it’s hot. There are about two hundred students watching. [laughs] Some of them are eating sandwiches!'],
        ['Sam', 'And the match is starting! Number seven, Marc, has the ball. He’s running… he’s jumping… and he scores! Two points for the Blue Team!'],
        ['Emma', 'Marc usually plays as a defender, but today he’s playing as a forward. And it’s working!'],
        ['Sam', 'Now the Green Team has the ball. Their captain, Júlia, is passing to number four… she’s shooting… and she misses. The Blue Team is winning, six to two.'],
        ['Emma', 'What a match! It’s half-time now. The players are drinking water and the coach is talking to the team. We’ll be back in ten minutes. Don’t go away!']] },
      chunks: ['the crowd is cheering', 'wearing green T-shirts and black shorts', 'It’s cold and rainy outside'],
      items: [
        { q: 'Where are Emma and Sam?', o: ['at the sports hall', 'at the skate park', 'at the swimming pool'], h: 'Escolta el principi: “We’re at the…”.' },
        { q: 'What is the Blue Team wearing?', o: ['a white uniform', 'green T-shirts', 'black shorts'], h: 'Escolta “The Blue Team is wearing…”.' },
        { q: 'What is the weather like outside?', o: ['cold and rainy', 'hot and sunny', 'windy'], h: 'Escolta l’Emma: “outside”.' },
        { r: 'insecure', q: 'What are some students doing?', o: ['eating sandwiches', 'playing basketball', 'sleeping'], h: 'Escolta després de la rialla.' },
        { q: 'What does Marc do?', o: ['He scores two points.', 'He misses.', 'He drinks water.'], h: 'Escolta “Number seven, Marc…”.' },
        { q: 'Who is winning at half-time?', o: ['the Blue Team, 6–2', 'the Green Team, 6–2', 'nobody: 2–2'], h: 'Escolta “is winning, … to …”.' },
        { r: 'safe', q: 'How does Marc usually play?', o: ['as a defender', 'as a forward', 'as a goalkeeper'] },
        { r: 'safe', q: 'What is Júlia doing when she gets the ball?', o: ['She passes to number four.', 'She scores.', 'She drinks water.'] },
        { r: 'daring', q: 'Why does Emma say “And it’s working!”?', o: ['Marc is playing in a new position and he is scoring.', 'The radio is working again.', 'The coach is working hard.'] },
        { r: 'daring', q: 'Which sentence describes something happening now?', o: ['“The players are drinking water.”', '“Marc usually plays as a defender.”', '“We’ll be back in ten minutes.”'] }
      ] },
    { id: 'again', type: 'mc', tab: { ca: 'Torna a escoltar', en: 'Listen again' }, title: { ca: 'Torna a escoltar: què estan fent?', en: 'Listen again: what are they doing?' }, pill: { ca: 'Àudio', en: 'Audio' },
      intro: { ca: 'Ja vas escoltar aquesta trucada a l’LP1. Ara escolta què està fent cada persona ara mateix.', en: 'You heard this phone call in LP1. Now listen for what each person is doing right now.' },
      media: { audio: 'audio/where-are-you.mp3', title: 'Where are you?', script: [
        ['Laia', '[cheerful] Hi Omar! Where are you? It’s really noisy.'],
        ['Omar', 'Hi Laia! I’m at the sports centre. My sister is playing basketball and I’m watching the match. She’s playing really well!'],
        ['Laia', 'Oh, nice! Do you go every Saturday?'],
        ['Omar', 'No, not every Saturday. I usually go swimming on Saturday mornings, but today the pool is closed. What about you? What are you doing?'],
        ['Laia', '[laughs] I’m at home. I’m drawing a comic about a cat who plays the guitar. And it’s raining, so I’m not going to the park.'],
        ['Omar', 'A cat who plays the guitar? I want to see it! Listen, the match finishes at twelve. Do you want to meet in the square at half past twelve?'],
        ['Laia', 'Perfect. I’ll bring the comic. See you there!'],
        ['Omar', 'See you!']] },
      chunks: ['I’m watching the match', 'I’m drawing a comic'],
      items: [
        { q: 'Where is Omar?', o: ['at the sports centre', 'at home', 'in the square'], h: 'Escolta “I’m at the…”.' },
        { q: 'What is Omar’s sister doing?', o: ['She’s playing basketball.', 'She’s swimming.', 'She’s watching a film.'], h: 'Escolta “My sister is…”.' },
        { q: 'What is Omar doing?', o: ['He’s watching the match.', 'He’s playing basketball.', 'He’s drawing.'], h: 'Escolta “and I’m…”.' },
        { q: 'What is Laia doing?', o: ['She’s drawing a comic.', 'She’s playing the guitar.', 'She’s going to the park.'], h: 'Escolta “I’m at home. I’m…”.' },
        { q: 'What’s the weather like where Laia is?', o: ['It’s raining.', 'It’s sunny.', 'It’s snowing.'], h: 'Escolta “And it’s…”.' },
        { r: 'insecure', q: 'Where are they meeting at half past twelve?', o: ['in the square', 'at the sports centre', 'at Laia’s house'], h: 'Escolta “Do you want to meet in…”.' },
        { r: 'safe', q: 'What does Omar usually do on Saturday mornings?', o: ['He goes swimming.', 'He plays basketball.', 'He draws comics.'] },
        { r: 'safe', q: 'Why isn’t Omar swimming today?', o: ['The pool is closed.', 'He’s ill.', 'It’s raining.'] },
        { r: 'daring', q: 'Laia says “It’s really noisy.” Why?', o: ['Omar is watching a basketball match at the sports centre.', 'Laia is playing the guitar.', 'Omar is in the square with friends.'] },
        { r: 'daring', q: 'Which sentence is about now, not about a habit?', o: ['My sister is playing basketball.', 'I usually go swimming.', 'Do you go every Saturday?'] }
      ] },
    { id: 'shadow', type: 'shadow', tab: { ca: 'Shadowing', en: 'Shadowing' }, title: { ca: 'Shadowing · Live from the sports hall (Emma and Sam)', en: 'Shadowing · Live from the sports hall (Emma and Sam)' }, pill: '3 ×',
      intro: { ca: 'Repeteix un tros de l’escolta just darrere de la veu, com una ombra.', en: 'Repeat part of the listening just behind the speaker, like a shadow.' },
      clip: { title: 'Live from the sports hall (Emma and Sam)', src: 'audio/live-from-the-sports-hall.mp3', slow: 'audio/live-from-the-sports-hall-slow.mp3', t: [0.38, 36.41], ts: [0.38, 42.22], lines: [
        ['Emma', 'Hello and welcome to School Radio! We’re at the sports hall and the big match is starting: the Blue Team against the Green Team. Sam, what’s happening?'],
        ['Sam', 'Well, Emma, the Blue Team is wearing their new white uniform and the Green Team is wearing green T-shirts and black shorts. The players are warming up and the crowd is cheering. It’s very noisy in here!'],
        ['Emma', 'It’s cold and rainy outside, but inside it’s hot. There are about two hundred students watching. Some of them are eating sandwiches!']], marks: [["Hel**lo**‿and **wel**come to **School** **Ra**dio! ↘", "We’re‿at the **sports** **hall** and the **big** **match**‿is **start**ing: the **Blue** **Team** a**gainst** the **Green** **Team**. ↘", "**Sam**, ↗ what’s **hap**pening? ↘"], ["**Well**, ↗ **Em**ma, ↗ the **Blue** **Team**‿is **wear**ing their **new** **white** **u**niform and the **Green** **Team** is **wear**ing **green** **T**-shirts‿and **black** **shorts**. ↘", "The **play**ers are **warm**ing‿**up** and the **crowd** is **cheer**ing. ↘", "It’s **ve**ry **noi**sy in **here**! ↘"], ["It’s **cold** and **rain**y‿out**side**, ↗ but in**side** it’s **hot**. ↘", "There are‿a**bout** **two** **hun**dred **stu**dents **watch**ing. ↘", "**Some**‿of them are **eat**ing **sand**wiches! ↘"]], cues: [[0.51, 3.23, 0.51, 3.64], [3.45, 9.21, 3.95, 10.73], [9.27, 11.01, 10.81, 12.77], [11.82, 20.06, 13.59, 23.18], [20.38, 23.78, 23.65, 27.61], [23.97, 25.77, 27.88, 29.92], [26.59, 30.52, 30.77, 35.3], [30.73, 33.41, 35.59, 38.72], [33.59, 36.31, 38.97, 42.12]] } },
    { id: 'grammar', type: 'typed', mode: 'listen', tab: { ca: 'Gramàtica', en: 'Grammar' }, title: 'Present Continuous', pill: { ca: 'Respon-ho tot', en: 'Answer all' },
      intro: { ca: 'Llegeix com funciona i completa. Si falles dues vegades, veuràs la resposta.', en: 'Read how it works and complete. After two wrong tries you will see the answer.' },
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
          { p: 'form', ca: head('👀', 'Present Continuous: el que passa ARA', 'Mira la foto: què està fent cadascú en aquest moment?') +
              scale([['slate', '🙋', 'I / she / they'], ['blue', 'am / is / are', '’m · ’s · ’re'], ['green', 'verb + ing', 'playing · skating']]) +
              table([['', '➕', '➖', '❓', 'Resposta curta'], ['I', 'I<b>’m playing</b>', 'I<b>’m not playing</b>', '<b>Am</b> I <b>playing</b>?', 'Yes, I am. / No, I’m not.'], ['he / she / it', 'She<b>’s skating</b>', 'She <b>isn’t skating</b>', '<b>Is</b> she <b>skating</b>?', 'Yes, she is. / No, she isn’t.'], ['you / we / they', 'They<b>’re watching</b>', 'They <b>aren’t watching</b>', '<b>Are</b> they <b>watching</b>?', 'Yes, they are. / No, they aren’t.']]) +
              row(card('blue', '📸 Exemples', ex('Look! Pol <b>is skating</b> on the big ramp.') + ex('I<b>’m watching</b> a match right now.') + ex('What <b>are</b> they <b>doing</b>? — They<b>’re taking</b> photos.'))) +
              mistakes('Compte!', bad('She skating.', 'She<b>’s</b> skating.', '(falta is)'), bad('Are you play?', 'Are you <b>playing</b>?'), bad('Yes, I’m.', 'Yes, I <b>am</b>.', '(sense contracció al final)')) +
              together(true, ['Look! The dog ___ (run).', '’s running'], ['___ they ___ (play)? — Yes, they are.', 'Are … playing'], ['I ___ (not / watch) TV now.', '’m not watching']) +
              turn('Ara tu:', 'mira la classe: escriu què estan fent tres companys ara mateix.'),
            en: head('👀', 'Present Continuous: what is happening NOW', 'Look at the photo: what is everyone doing at this moment?') +
              scale([['slate', '🙋', 'I / she / they'], ['blue', 'am / is / are', '’m · ’s · ’re'], ['green', 'verb + ing', 'playing · skating']]) +
              table([['', '➕', '➖', '❓', 'Short answer'], ['I', 'I<b>’m playing</b>', 'I<b>’m not playing</b>', '<b>Am</b> I <b>playing</b>?', 'Yes, I am. / No, I’m not.'], ['he / she / it', 'She<b>’s skating</b>', 'She <b>isn’t skating</b>', '<b>Is</b> she <b>skating</b>?', 'Yes, she is. / No, she isn’t.'], ['you / we / they', 'They<b>’re watching</b>', 'They <b>aren’t watching</b>', '<b>Are</b> they <b>watching</b>?', 'Yes, they are. / No, they aren’t.']]) +
              row(card('blue', '📸 Examples', ex('Look! Pol <b>is skating</b> on the big ramp.') + ex('I<b>’m watching</b> a match right now.') + ex('What <b>are</b> they <b>doing</b>? — They<b>’re taking</b> photos.'))) +
              mistakes('Watch out', bad('She skating.', 'She<b>’s</b> skating.', '(is is missing)'), bad('Are you play?', 'Are you <b>playing</b>?'), bad('Yes, I’m.', 'Yes, I <b>am</b>.', '(no contraction at the end)')) +
              together(false, ['Look! The dog ___ (run).', '’s running'], ['___ they ___ (play)? — Yes, they are.', 'Are … playing'], ['I ___ (not / watch) TV now.', '’m not watching']) +
              turn('Your turn:', 'look around the class: write what three classmates are doing right now.') },
          { p: 'spell', ca: head('✍️', 'Com s’escriu la -ing?', 'Tres regles, i ja les saps totes.') +
              row(card('green', '1️⃣ Normalment: + ing', ex('play → play<b>ing</b>') + ex('watch → watch<b>ing</b>') + ex('read → read<b>ing</b>'), 180),
                card('orange', '2️⃣ Acaba en -e: treu la -e', ex('danc<del>e</del> → danc<b>ing</b>') + ex('mak<del>e</del> → mak<b>ing</b>') + ex('writ<del>e</del> → writ<b>ing</b>'), 180),
                card('purple', '3️⃣ Vocal + consonant: dobla-la', ex('swi<b>m</b> → swi<b>mm</b>ing') + ex('ru<b>n</b> → ru<b>nn</b>ing') + ex('si<b>t</b> → si<b>tt</b>ing · ge<b>t</b> → ge<b>tt</b>ing'), 180)) +
              mistakes('Compte!', bad('danceing', 'danc<b>ing</b>'), bad('runing', 'ru<b>nn</b>ing'), bad('studing', 'stud<b>y</b>ing', '(la -y es queda)')) +
              together(true, ['swim → ___ · write → ___ · play → ___', 'swimming · writing · playing']) +
              turn('Ara tu:', 'escriu la forma -ing de: <em>swim, ride, shop, cook, have</em>.'),
            en: head('✍️', 'How do you spell -ing?', 'Three rules, and you know them all.') +
              row(card('green', '1️⃣ Usually: + ing', ex('play → play<b>ing</b>') + ex('watch → watch<b>ing</b>') + ex('read → read<b>ing</b>'), 180),
                card('orange', '2️⃣ Ends in -e: drop the -e', ex('danc<del>e</del> → danc<b>ing</b>') + ex('mak<del>e</del> → mak<b>ing</b>') + ex('writ<del>e</del> → writ<b>ing</b>'), 180),
                card('purple', '3️⃣ Vowel + consonant: double it', ex('swi<b>m</b> → swi<b>mm</b>ing') + ex('ru<b>n</b> → ru<b>nn</b>ing') + ex('si<b>t</b> → si<b>tt</b>ing · ge<b>t</b> → ge<b>tt</b>ing'), 180)) +
              mistakes('Watch out', bad('danceing', 'danc<b>ing</b>'), bad('runing', 'ru<b>nn</b>ing'), bad('studing', 'stud<b>y</b>ing', '(keep the -y)')) +
              together(false, ['swim → ___ · write → ___ · play → ___', 'swimming · writing · playing']) +
              turn('Your turn:', 'write the -ing form of: <em>swim, ride, shop, cook, have</em>.') },
          { p: 'now', r: 'safe', en: head('⏱', 'Words that say NOW', 'When you see them, think Present Continuous.') +
              '<div>' + ['now', 'right now', 'at the moment', 'today', 'this weekend', 'this week', 'Look!', 'Listen!'].map(w => pill('blue', w)).join('') + '</div>' +
              row(card('blue', 'Examples', ex('The crowd <b>is cheering</b> at the moment.') + ex('<b>Listen!</b> Somebody <b>is playing</b> the guitar.') + ex('<b>This weekend</b> we<b>’re playing</b> in a tournament.'))) +
              tip('Short answers:', 'never contract at the end. <em>Is she playing well? — Yes, she <b>is</b>.</em>') +
              mistakes('Watch out', bad('Yes, she’s.', 'Yes, she <b>is</b>.')) + together(false, ['Listen! Somebody ___ (sing).', 'is singing'], ['Is he running? — Yes, he ___.', 'is']) +
              turn('Your turn:', 'two sentences about this weekend with <em>this weekend</em> and <em>at the moment</em>.') },
          { p: 'order', r: 'daring', en: head('❓', 'Word order in questions', 'Question word → am / is / are → who → verb-ing.') +
              table([['Question word', 'am / is / are', 'subject', 'verb-ing', '?'], ['Why', 'are', 'the fans', 'cheering', '?'], ['What', 'is', 'Marta', 'doing', '?'], ['Where', 'are', 'you', 'going', '?']]) +
              tip('Who as the subject:', 'no extra person after it: <em><b>Who is scoring</b>? — Marc!</em>') +
              mistakes('Watch out', bad('Why the fans are cheering?', 'Why <b>are</b> the fans cheering?'), bad('Who is he scoring?', 'Who is scoring?')) +
              together(false, ['Order: is / what / doing / Pau → ___?', 'What is Pau doing?']) +
              turn('Your turn:', 'ask your partner three questions about a photo with <em>What, Why, Who</em>.') }
        ];
      })(),
      // blocks, 4 compulsory each (3 + … or 4 questions), the rest ➕ extra practice (Roger, 13 Nov 2026: "not about volume but quality")
      req: 4,
      parts: [
        { id: 'form', title: { ca: 'am / is / are + -ing', en: 'am / is / are + -ing' }, note: { ca: '➕ <em>She’s skating</em> · ➖ <em>She isn’t skating</em> · ❓ <em>Is she skating?</em>', en: '➕ <em>She’s skating</em> · ➖ <em>She isn’t skating</em> · ❓ <em>Is she skating?</em>' } },
        { id: 'spell', title: { ca: 'Com s’escriu la -ing', en: 'How to spell -ing' }, note: { ca: '+ing · treu la -e · dobla la consonant', en: '+ing · drop the -e · double the consonant' } },
        { id: 'now', title: { en: 'Words that say now' }, note: { en: '<em>now, at the moment, today, this weekend, Look!</em> · short answers: <em>Yes, she <b>is</b>.</em>' } },
        { id: 'order', title: { en: 'Word order in questions' }, note: { en: 'Question word + am / is / are + subject + -ing' } }
      ],
      items: [
        { p: 'form', q: 'Look! Pol ___ (skate) on the big ramp.', a: ['is skating', "'s skating"], ca: 'he → is + skating.', en: 'he → is + skating.' },
        { p: 'form', q: 'I ___ (watch) a basketball match right now.', a: ['am watching', "'m watching"], ca: 'I → am + watching.', en: 'I → am + watching.' },
        { p: 'form', q: 'They ___ (wear) green T-shirts today.', a: ['are wearing', "'re wearing"], ca: 'they → are + wearing.', en: 'they → are + wearing.' },
        { p: 'form', q: 'She ___ (dance) in the show.', a: ['is dancing', "'s dancing"], ca: 'dance → dancing (sense -e).', en: 'dance → dancing (drop the -e).' },
        { p: 'form', q: 'The children ___ (run) in the park.', a: ['are running', "'re running"], ca: 'run → running.', en: 'run → running.' },
        { p: 'form', r: 'insecure', q: 'It ___ (not / rain) now. It’s sunny!', a: ["isn't raining", 'is not raining', "'s not raining"], ca: 'Negativa: isn’t + raining.', en: 'Negative: isn’t + raining.' },
        { p: 'form', r: 'insecure', q: '___ you ___ (listen) to music? — Yes, I am.', a: ['are listening'], ca: 'Pregunta: Are you listening?', en: 'Question: Are you listening?' },
        { p: 'form', r: 'insecure', q: 'What ___ Marta ___ (do)? — She’s taking photos.', a: ['is doing'], ca: 'What + is + Marta + doing?', en: 'What + is + Marta + doing?' },
        { p: 'form', r: 'insecure', q: 'Is Hugo playing football? — No, he ___.', a: ["isn't"], ca: 'Resposta curta negativa: No, he isn’t.', en: 'Short answer: No, he isn’t.' },
        { p: 'form', r: 'insecure', q: 'I ___ (not / play) video games. I’m doing my homework.', a: ["'m not playing", 'am not playing'], ca: 'I’m not + playing.', en: 'I’m not + playing.' },
        { p: 'form', a: [], own: { must: ["\\b(am|is|are|['’]m|['’]s|['’]re)\\s+\\w+ing\\b"], min: 10 }, q: "Your turn: look around the class: write what three classmates are doing right now. <span class=\"tiny\">(Mira la classe: escriu què estan fent tres companys ara mateix.)</span>", show: "Marc is writing. Laia is reading. Pol and Ana are talking.", ca: "is / are + verb-ing.", en: "is / are + verb-ing." },
        { p: 'spell', q: 'We ___ (swim) in the sea. (atenció a l’ortografia)', a: ['are swimming', "'re swimming"], ca: 'swim → swimming (dobla la m).', en: 'swim → swimming (double m).' },
        { p: 'spell', q: 'Write the -ing form: sit → ___', a: ['sitting'], ca: 'Dobla la t.', en: 'Double the t.' },
        { p: 'spell', q: 'Write the -ing form: make → ___', a: ['making'], ca: 'Treu la -e.', en: 'Drop the -e.' },
        { p: 'spell', q: 'Write the -ing form: read → ___', a: ['reading'], ca: 'Dues vocals: no es dobla.', en: 'Two vowels: no double consonant.' },
        { p: 'spell', r: 'safe', q: 'Write the -ing form: get → ___', a: ['getting'], en: 'Vowel + consonant: double it.' },
        { p: 'spell', r: 'safe', q: 'Write the -ing form: write → ___', a: ['writing'], en: 'Drop the -e.' },
        { p: 'spell', r: 'daring', q: 'Correct the mistake: “She’s studing for the exam.” → ___', a: ['studying'], en: 'Verbs ending in -y keep the y: studying.' },
        { p: 'spell', r: 'daring', q: 'Correct the mistake: “They are runing in the park.” → ___', a: ['running'], en: 'Double the n.' },
        { p: 'spell', a: [], own: { must: ["\\bswimming\\b", "\\briding\\b", "\\bshopping\\b", "\\bcooking\\b", "\\bhaving\\b"], min: 5 }, q: "Your turn: write the -ing form of: <em>swim, ride, shop, cook, have</em>. <span class=\"tiny\">(Escriu la forma -ing d’aquests cinc verbs.)</span>", show: "swimming, riding, shopping, cooking, having", ca: "Pensa en les tres regles.", en: "Think of the three rules." },
        { p: 'now', r: 'safe', q: 'The crowd ___ (cheer) at the moment: the match is exciting.', a: ['is cheering', "'s cheering"], en: 'Crowd is singular: is.' },
        { p: 'now', r: 'safe', q: 'Is she playing well? — Yes, she ___. (no contraction)', a: ['is'], en: 'Short answers have no contraction.' },
        { p: 'now', r: 'safe', q: 'Why ___ you ___ (wear) a helmet? — Because I’m going cycling.', a: ['are wearing'], en: 'Why + are + you + wearing?' },
        { p: 'now', r: 'safe', q: 'Who ___ (score)? — Marc!', a: ['is scoring', "'s scoring"], en: 'Who is the subject: Who is scoring?' },
        { p: 'now', r: 'daring', q: 'Twenty teams ___ (take) part in the tournament this weekend.', a: ['are taking', "'re taking"], en: 'Plural subject: are taking.' },
        { p: 'now', r: 'safe', a: [], own: { must: ["\\bthis weekend\\b", "\\bat the moment\\b"], min: 10 }, q: "Your turn: two sentences about you with <b>this weekend</b> and <b>at the moment</b>.", show: "I’m visiting my grandparents this weekend. At the moment I’m studying English.", en: "am / is / are + -ing with this weekend / at the moment." },
        { p: 'order', r: 'daring', q: 'Order the words: are / why / the fans / cheering → ___?', a: ['why are the fans cheering'], en: 'Question word + are + subject + -ing.' },
        { p: 'order', r: 'daring', a: [], own: { must: ["\\bwhat\\b", "\\bwhy\\b", "\\bwho\\b", "\\?"], min: 10 }, q: "Your turn: three questions about a photo with <b>What</b>, <b>Why</b> and <b>Who</b>.", show: "What is the boy doing? Why are the fans cheering? Who is winning?", en: "Question word + am / is / are + subject + -ing?" }
      ] },
    { id: 'mixed', type: 'typed', mode: 'say', tab: { ca: 'Barreja', en: 'Mixed' }, title: { ca: 'Pràctica barrejada: ara o normalment?', en: 'Mixed practice: now or usually?' }, pill: { ca: 'Respon-ho tot', en: 'Answer all' },
      intro: { ca: 'Barreja de formes: decideix si la frase parla d’ara (Present Continuous) o d’un hàbit (Present Simple).', en: 'Mixed forms: decide if the sentence is about now (Present Continuous) or a habit (Present Simple).' },
      items: [
        { q: 'I usually ___ (play) football on Saturdays.', a: ['play'], ca: 'usually → hàbit → Present Simple.', en: 'usually → habit → Present Simple.' },
        { q: 'Today I ___ (play) basketball.', a: ['am playing', "'m playing"], ca: 'today → ara → Present Continuous.', en: 'today → now → Present Continuous.' },
        { q: 'Look! It ___ (snow)!', a: ['is snowing', "'s snowing"], ca: 'Look! → ara.', en: 'Look! → now.' },
        { q: 'She ___ (go) swimming every Monday.', a: ['goes'], ca: 'every Monday → hàbit.', en: 'every Monday → habit.' },
        { q: 'Now I ___ (listen) to music in my room.', a: ['am listening', "'m listening"], ca: 'now → ara → Present Continuous.', en: 'now → Present Continuous.' },
        { r: 'insecure', q: 'Omar ___ (not / swim) now: the pool is closed.', a: ["isn't swimming", 'is not swimming', "'s not swimming"], ca: 'now → Present Continuous negatiu.', en: 'now → Present Continuous negative.' },
        { r: 'safe', q: 'Marc usually plays as a defender, but today he ___ (play) as a forward.', a: ['is playing', "'s playing"], en: 'today → now → is playing.' },
        { r: 'safe', q: 'What ___ you usually do at the weekend? (do / are)', a: ['do'], en: 'usually → Present Simple: What do you usually do?' },
        { r: 'safe', q: 'We ___ (train) twice a week, on Tuesdays and Thursdays.', a: ['train'], en: 'twice a week → habit.' },
        { r: 'daring', q: 'My brother doesn’t like video games, but right now he ___ (play) one with me!', a: ['is playing', "'s playing"], en: 'right now → is playing.' },
        { r: 'daring', q: 'Correct the mistake: “Listen! The band plays my favourite song.” → The band ___ my favourite song.', a: ['is playing', "'s playing"], en: 'Listen! → happening now.' }
      ] },
    { id: 'write', type: 'writing', product: 1, tab: { ca: 'Escriptura', en: 'Writing' }, title: { ca: 'Peça 1: en aquesta foto…', en: 'Piece 1: in this photo…' },
      intro: { ca: 'Tria una foto d’una activitat de temps lliure (teva, de la família o d’un esdeveniment) i descriu-la. És la primera peça del teu vlog.', en: 'Choose a photo of a free-time activity (yours, your family’s or from an event) and describe it. This is the first piece of your vlog.' },
      task: { beginners: 'Descriu la foto (35–50 paraules) amb la pauta. Canvia només les paraules que calgui: on sou, quin temps fa, què està fent una persona (una frase amb <em>is + -ing</em>) i què portes posat.', insecure: 'Descriu la foto (40–60 paraules): qui hi surt, on són, quin temps fa, què estan fent (dues o tres frases amb Present Continuous), què porten posat i què fan normalment (una frase amb Present Simple).', safe: 'Describe the photo (60–80 words): who is in it, where and when it was taken, the weather, what people are doing (three or four Present Continuous sentences), what they are wearing or using, and what they usually do there (Present Simple).', daring: 'Describe the photo (80–110 words) for someone who cannot see it: the place, the weather, what people are doing and wearing, one detail that makes the moment special, and what usually happens there. Link your sentences with <em>and, but, because, so</em>.' },
      frame: { beginners: '<strong>Pauta:</strong> In this photo, I’m at ___ with ___. It’s ___. ___ is ___-ing. I’m wearing ___. We usually ___ here.<br><strong>Paraules:</strong> the park · the beach · my friends · my family · sunny · cold · playing · swimming · skating · a T-shirt · a cap · play football · go swimming', insecure: '<strong>Pauta:</strong> In this photo, I’m at ___ with ___. It’s ___ (sunny / cold…). ___ is ___-ing and ___ are ___-ing. I’m wearing ___. We usually ___ on ___.' },
      model: { ca: 'In this photo, I’m at the beach with my cousins. It’s hot and sunny. My cousin Laia is swimming and my uncle is reading. I’m wearing a cap and shorts. We usually go to the beach in August.', en: 'In this photo, I’m at the beach with my cousins. It’s hot and sunny, so everybody is in the water. My cousin Laia is swimming and my uncle is reading under the umbrella. I’m wearing a cap and shorts, because the sun is very strong. We usually go to this beach in August.' },
      min: { beginners: 35, insecure: 40, safe: 60, daring: 80 },
      checklist: { beginners: ['Una frase amb is / are + -ing', 'Quin temps fa', 'Què portes posat', 'He seguit la pauta'], insecure: ['Dues o tres frases amb am / is / are + -ing', 'Una frase amb Present Simple (usually)', 'Quin temps fa', 'Què porten posat'], safe: ['Three or four Present Continuous sentences', 'One Present Simple sentence with usually', 'The weather and the clothes or kit', 'Where and when'], daring: ['Present Continuous and Present Simple used correctly', 'and / but / because / so', 'One special detail', 'The weather, the clothes or kit, where and when'] } },
    { id: 'speak', type: 'speaking', tab: 'Speaking', title: { ca: 'Speaking: descriu la foto', en: 'Speaking: describe the photo' },
      intro: { ca: 'Mira la teva foto i grava’t descrivint-la. Mira les notes, no llegeixis.', en: 'Look at your photo and record yourself describing it. Use notes; don’t read.' },
      task: { beginners: 'Digues tres frases sobre la foto amb el model: on sou, quin temps fa i què està fent una persona (15–25 segons).', insecure: 'Digues quatre frases sobre la foto: on sou, quin temps fa, què està fent la gent i què porteu (20–30 segons).', safe: 'Describe your photo live, as in a vlog: where you are, the weather, what people are doing and wearing, and what you usually do there (30–45 s).', daring: 'Describe your photo live, as in a vlog, and add why the moment is special and what you usually do there (45–60 s).' },
      model: { beginners: 'In this photo, we’re at the park. It’s sunny. My friend is playing football.', insecure: 'In this photo, we’re at the park. It’s sunny. My friends are playing football and I’m taking the photo. We’re wearing T-shirts.', safe: 'Hi everyone! In this photo, I’m at the skate park with Pol. It’s cloudy but it isn’t cold. Pol is skating and I’m filming. We’re wearing helmets, of course. We usually come here on Saturday mornings.', daring: 'Hi everyone! In this photo, I’m at the sports hall and the crowd is cheering, because my sister is playing in the final. She’s wearing the white uniform, number seven. It’s a special day: she usually plays as a defender, but today she’s scoring all the points!' } },
    { id: 'talk', type: 'talk', tab: { ca: 'Conversa', en: 'Talk' }, title: { ca: 'Conversa: videotrucada', en: 'Talk: video call' },
      intro: { ca: 'Un amic et fa una videotrucada un dissabte. Respon les seves preguntes.', en: 'A friend video-calls you on a Saturday. Answer the questions.' },
      task: { beginners: 'Respon amb frases curtes amb el Present Continuous (I’m … -ing). Fes servir el model i canvia les paraules.', insecure: 'Respon amb frases completes amb el Present Continuous i afegeix un detall: on ets, amb qui, quin temps fa.', safe: 'Answer in two or three sentences each. Use the Present Continuous for now and describe what is happening around you.', daring: 'Answer in detail. Describe what is happening around you, and compare it with what you usually do on Saturdays.' },
      partner: [
        { q: 'Hi! Where are you?', ca: 'On ets?' },
        { q: 'What are you doing right now?', ca: 'Què estàs fent ara mateix?' },
        { q: 'Who are you with?', ca: 'Amb qui ets?' },
        { r: 'insecure', q: 'What’s the weather like?', ca: 'Quin temps fa?' },
        { r: 'safe', q: 'What are the people around you doing?' },
        { r: 'safe', q: 'What are you wearing today?' },
        { r: 'daring', q: 'Is this what you usually do on Saturdays?' }
      ],
      model: { beginners: 'I’m at the park. I’m playing football. I’m with my friends.', insecure: 'I’m at the park. I’m playing football with my friends. I’m with Pau and Martina. It’s sunny but cold.', safe: 'Hi! I’m at the park near my house. Right now I’m playing football with my friends, and we’re winning! I’m with Pau and Martina. Some children are riding their bikes and a man is walking his dog. I’m wearing my blue tracksuit.', daring: 'Hi! I’m at the park near my house and I’m playing football with Pau and Martina. We’re winning three to one! Around me, some kids are riding their bikes and an old man is feeding the pigeons. It’s sunny but really cold, so I’m wearing my blue tracksuit and gloves. It isn’t what I usually do: on Saturdays I usually go swimming, but today the pool is closed.' } }
  ]
};
