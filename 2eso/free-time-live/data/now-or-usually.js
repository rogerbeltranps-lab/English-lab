/* 2 ESO · LS2 Free Time, Live! · Learning Path 3 · Now or usually? (Present Simple vs Present Continuous; listening chart = LS criterion 2.2) */
window.LP = {
  key: 'ls2NowUsually2ESO', n: 3, starter: true, title: 'Now or usually?',
  panels: [
    { id: 'recall', type: 'recall', tab: 'Recall', title: { ca: 'Recall: Learning Paths 1 i 2', en: 'Recall: Learning Paths 1 and 2' }, pill: { ca: 'Sense apunts', en: 'No notes' },
      intro: { ca: 'Escriu les respostes sense mirar res.', en: 'Type the answers without looking.' },
      items: [
        { q: 'Look! Pol ___ (skate) on the ramp.', a: ['is skating', "'s skating"] },
        { r: 'insecure', q: 'They ___ (not / play) football today: it’s raining.', a: ["aren't playing", 'are not playing', "'re not playing"] },
        { q: 'Write the -ing form: swim → ___', a: ['swimming'] },
        { q: 'Write the -ing form: dance → ___', a: ['dancing'] },
        { q: 'It’s 30 degrees. It’s very ___. (calor)', a: ['hot'] },
        { q: 'On your bike, wear a ___. (casc)', a: ['helmet'] },
        { r: 'insecure', q: 'She ___ karate on Tuesdays. (fer)', a: ['does'] },
        { r: 'insecure', q: '___ you watching the match? — Yes, I am.', a: ['are'] },
        { r: 'safe', q: 'Our team is playing in a basketball ___ with 12 teams.', a: ['tournament'] },
        { r: 'safe', q: 'It’s ___: I can’t see the end of the street.', a: ['foggy'] },
        { r: 'daring', q: 'The ___ is cheering: 500 people!', a: ['crowd'] },
        { r: 'daring', q: 'Correct: “She’s studing.” → She’s ___.', a: ['studying'] }
      ] },
    { id: 'vocab', type: 'vocab', practiceMode: 'listen', tab: { ca: 'Vocabulari', en: 'Vocabulary' }, title: { ca: 'Ara o normalment: expressions de temps', en: 'Now or usually: time expressions' },
      intro: { ca: 'Explora, practica amb les targetes i completa les frases.', en: 'Explore, practise with the cards and complete the sentences.' },
      receptive: 'livestream · subscribers · highlights',
      core: { beginners: ['now', 'right now', 'today', 'Look! / Listen!', 'usually', 'on Saturday mornings', 'every weekend', 'always / never'], insecure: ['now', 'right now', 'at the moment', 'today', 'this weekend', 'Look! / Listen!', 'usually', 'on Saturday mornings', 'every weekend', 'always / never', 'in winter / in summer'], safe: ['now', 'right now', 'at the moment', 'today', 'this weekend', 'Look! / Listen!', 'usually', 'on Saturday mornings', 'every weekend', 'always / never', 'in winter / in summer', 'practise', 'train', 'go to a concert', 'watch a match', 'temperature'], daring: ['now', 'right now', 'at the moment', 'this weekend', 'usually', 'on Saturday mornings', 'every weekend', 'always / never', 'in winter / in summer', 'practise', 'train', 'watch a match', 'temperature', 'know', 'need', 'want', 'prefer', 'believe', 'understand', 'mean'] },
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
          { ca: head('📊', 'Quantes vegades? <em>always, usually, never</em>', 'Aquestes paraules diuen com de sovint fas una cosa.') +
              scale([['green', '100 %', 'always'], ['teal', '80 %', 'usually'], ['amber', '50 %', 'sometimes'], ['red', '0 %', 'never']]) +
              row(card('blue', '📍 On van?', ex('<b>davant</b> del verb: I <b>usually</b> play on Saturdays.') + ex('She <b>never</b> gets up late.') + ex('<b>darrere</b> de <em>be</em>: He <b>is always</b> happy.'))) +
              mistakes('Compte!', bad('I play usually on Saturdays.', 'I <b>usually play</b> on Saturdays.'), bad('She gets never up late.', 'She <b>never gets</b> up late.')) +
              together(true, ['Order: never / I / late / get up → ___', 'I never get up late.']) +
              turn('Ara tu:', 'una cosa que fas sempre, una que fas normalment i una que no fas mai.'),
            en: head('📊', 'How often? <em>always, usually, never</em>', 'These words say how often you do something.') +
              scale([['green', '100 %', 'always'], ['teal', '80 %', 'usually'], ['amber', '50 %', 'sometimes'], ['red', '0 %', 'never']]) +
              row(card('blue', '📍 Where do they go?', ex('<b>before</b> the verb: I <b>usually</b> play on Saturdays.') + ex('She <b>never</b> gets up late.') + ex('<b>after</b> <em>be</em>: He <b>is always</b> happy.'))) +
              mistakes('Watch out', bad('I play usually on Saturdays.', 'I <b>usually play</b> on Saturdays.'), bad('She gets never up late.', 'She <b>never gets</b> up late.')) +
              together(false, ['Order: never / I / late / get up → ___', 'I never get up late.']) +
              turn('Your turn:', 'one thing you always do, one you usually do and one you never do.') },
          { ca: head('🕐', 'Expressions de temps: <em>on</em>, <em>at</em>, <em>in</em> o res?', '') +
              row(card('purple', 'ON + dies', ex('<b>on</b> Saturdays') + ex('<b>on</b> Saturday mornings'), 160),
                card('orange', 'AT', ex('<b>at</b> the weekend') + ex('<b>at</b> the moment'), 160),
                card('blue', 'IN', ex('<b>in</b> winter · <b>in</b> summer') + ex('<b>in</b> the morning'), 160),
                card('teal', '— res', ex('<b>every</b> weekend') + ex('<b>today</b> · <b>now</b> · <b>this</b> weekend'), 160)) +
              mistakes('Compte!', bad('in Saturday', '<b>on</b> Saturday'), bad('on every weekend', '<b>every</b> weekend'), bad('every weekends', 'every <b>weekend</b>')) +
              together(true, ['___ Sundays · ___ the weekend · ___ summer', 'on · at · in']) +
              turn('Ara tu:', 'què fas <em>on Saturday mornings</em>, <em>in summer</em> i <em>this weekend</em>?'),
            en: head('🕐', 'Time expressions: <em>on</em>, <em>at</em>, <em>in</em> or nothing?', '') +
              row(card('purple', 'ON + days', ex('<b>on</b> Saturdays') + ex('<b>on</b> Saturday mornings'), 160),
                card('orange', 'AT', ex('<b>at</b> the weekend') + ex('<b>at</b> the moment'), 160),
                card('blue', 'IN', ex('<b>in</b> winter · <b>in</b> summer') + ex('<b>in</b> the morning'), 160),
                card('teal', '— nothing', ex('<b>every</b> weekend') + ex('<b>today</b> · <b>now</b> · <b>this</b> weekend'), 160)) +
              mistakes('Watch out', bad('in Saturday', '<b>on</b> Saturday'), bad('on every weekend', '<b>every</b> weekend'), bad('every weekends', 'every <b>weekend</b>')) +
              together(false, ['___ Sundays · ___ the weekend · ___ summer', 'on · at · in']) +
              turn('Your turn:', 'what do you do <em>on Saturday mornings</em>, <em>in summer</em> and <em>this weekend</em>?') }
        ];
      })(),
      groups: [
        { g: 'Now (Present Continuous)', items: [['now', 'ara', 'I’m at home now.'], ['right now', 'ara mateix', 'Right now I’m watching a match.'], ['at the moment', 'en aquest moment', 'At the moment she’s training.'], ['today', 'avui', 'Today we’re playing inside.'], ['this weekend', 'aquest cap de setmana', 'This weekend I’m going to a concert.'], ['Look! / Listen!', 'Mira! / Escolta!', 'Look! It’s snowing!']] },
        { g: 'Usually (Present Simple)', items: [['usually', 'normalment', 'I usually play on Saturdays.'], ['on Saturday mornings', 'els dissabtes al matí', 'We train on Saturday mornings.'], ['every weekend', 'cada cap de setmana', 'He goes cycling every weekend.'], ['always / never', 'sempre / mai', 'She never gets up late.'], ['in winter / in summer', 'a l’hivern / a l’estiu', 'In winter we go skating.']] },
        { r: 'safe', g: 'Doing sport (Safe)', items: [['practise', 'practicar', 'I practise my turns every day.'], ['train', 'entrenar', 'We train twice a week.'], ['go to a concert', 'anar a un concert', 'We’re going to a concert tonight.'], ['watch a match', 'mirar un partit', 'I usually watch the match on TV.'], ['temperature', 'temperatura', 'The temperature is three degrees.']] },
        { r: 'daring', g: 'State verbs (Daring)', items: [['know', 'saber, conèixer', 'I know the answer.'], ['need', 'necessitar', 'I need new trainers.'], ['want', 'voler', 'She wants to join the team.'], ['prefer', 'preferir', 'I prefer skating to cycling.'], ['believe', 'creure', 'I believe you.'], ['understand', 'entendre', 'Do you understand the rules?'], ['mean', 'voler dir', 'What does “crowd” mean?']] }
      ],
      review: [
        { g: 'Learning Path 2', items: [['trainers', 'bambes', 'I need new trainers.'], ['It’s windy', 'fa vent', 'It’s windy today.'], ['wear a costume', 'portar una disfressa', 'People wear costumes at the fair.']] },
        { r: 'safe', g: 'Learning Path 2', items: [['a tournament', 'un torneig', 'We’re playing in a tournament.'], ['freezing', 'gèlid', 'It’s freezing!']] }
      ],
      practice: [
        { q: 'I can’t talk ___ now: I’m in class. (ara mateix)', a: ['right'] },
        { q: 'At the ___ she’s training for a show. (en aquest moment)', a: ['moment'] },
        { q: 'We ___ go to the park on Sundays. (normalment)', a: ['usually'] },
        { q: 'I play football ___ Saturday mornings.', a: ['on'] },
        { r: 'insecure', q: '___ weekend we’re going to a tournament. (aquest)', a: ['this'] },
        { q: 'My dad ___ gets up late: he’s always up at 6! (mai)', a: ['never'] },
        { r: 'insecure', q: '___ winter we go skating in the square.', a: ['in'] },
        { q: '___! It’s snowing! (Mira!)', a: ['look'] },
        { r: 'safe', q: 'I ___ the piano every day for twenty minutes. (practicar)', a: ['practise', 'practice'] },
        { r: 'safe', q: 'The ___ is only two degrees: it’s freezing.', a: ['temperature'] },
        { r: 'safe', q: 'We’re going ___ a concert on Friday.', a: ['to'] },
        { r: 'daring', q: 'I ___ skating to cycling. (preferir)', a: ['prefer'] },
        { r: 'daring', q: 'What does “highlights” ___? (voler dir)', a: ['mean'] },
        { r: 'daring', q: 'I ___ new gloves: mine are broken. (necessitar)', a: ['need'] }
      ] },
    { id: 'listen', type: 'mc', tab: 'Listening', title: 'Listening: Mei’s Saturday vlog', pill: { ca: 'Vídeo', en: 'Video' },
      intro: { ca: 'Mira el vlog de la Mei una vegada per saber on és. Després llegeix les preguntes i torna’l a mirar. A la ruta Insecure pots triar la versió més lenta.', en: 'Watch Mei’s vlog once to find out where she is. Then read the questions and watch again.' },
      media: { videos: [{ base: 'video/mei-ice-rink', title: 'Video 1 · Mei: Saturday at the ice rink' }], videoCredit: 'Illustrated video made for English Lab. Voice generated with ElevenLabs.' },
      chunks: ['I\'m wearing a woolly hat', 'I usually come here', 'I\'m training for the Christmas show'],
      items: [
        { q: 'Where is Mei?', o: ['at the ice rink in the town square', 'at the swimming pool', 'at school'], h: 'Escolta “Right now I’m at…”.' },
        { q: 'What is the weather like?', o: ['cold and cloudy', 'hot and sunny', 'rainy'], h: 'Escolta “It’s December, so…”.' },
        { q: 'What is Mei wearing?', o: ['a woolly hat, gloves and a red jacket', 'a cap and shorts', 'a helmet and a tracksuit'], h: 'Escolta “I’m wearing…”.' },
        { q: 'What is her brother Kai doing?', o: ['skating and falling', 'taking photos', 'dancing'], h: 'Escolta “Look! My brother Kai…”.' },
        { q: 'When does Mei usually go to the ice rink?', o: ['on Sunday afternoons', 'on Saturday mornings', 'every day'], h: 'Escolta “I usually come here…”.' },
        { r: 'insecure', q: 'Why is today different?', o: ['She’s training for the Christmas show.', 'The rink is closed.', 'It’s her birthday.'], h: 'Escolta “But today is different…”.' },
        { r: 'safe', q: 'What is Mei practising?', o: ['her turns', 'her jumps', 'a song'] },
        { r: 'safe', q: 'Who does she usually come with?', o: ['her family', 'her dance group', 'her friends from school'] },
        { r: 'daring', q: 'Why does Mei laugh when she talks about Kai?', o: ['because he is falling again', 'because he is skating very well', 'because he is wearing a funny hat'] },
        { r: 'daring', q: 'Which sentence talks about something temporary, not a habit?', o: ['“I’m training for the Christmas show.”', '“I usually come here on Sunday afternoons.”', '“It’s December.”'] }
      ] },
    // LS criterion 2.2: a listening chart on two short vlogs: what each vlogger is doing, what they usually do and two details (place, clothes or weather).
    { id: 'chart', type: 'step', tab: { ca: 'Graella d’escolta', en: 'Listening chart' }, title: { ca: 'Graella d’escolta: dos vlogs', en: 'Listening chart: two vlogs' }, pill: { ca: 'Ho veu el professor', en: 'Your teacher sees it' },
      intro: { ca: 'Mira els dos vlogs dues vegades (a la ruta Beginners, només el vídeo 1). La primera, per saber on és cada persona. La segona, per omplir la graella: què està fent ara, què fa normalment i dos detalls (lloc, roba o temps). Fes servir les imatges, les paraules clau i el context.', en: 'Watch both vlogs twice: first to find out where each vlogger is, then to fill in the chart: what they are doing now, what they usually do and two details (place, clothes or weather). Use the images, the key words and the context.' },
      html: { ca: '<div class="model"><strong>Pistes:</strong> <em>Right now / today / this weekend</em> = ara · <em>usually / on Sunday mornings</em> = normalment. Mira les imatges: la roba i el temps també hi surten.</div>', en: '<p class="tiny">Listen for <em>right now / today / this weekend</em> (now) and <em>usually / on Sunday mornings</em> (habit). The images show the clothes and the weather too.</p>' },
      media: { videos: [{ base: 'video/mei-ice-rink', title: 'Video 1 · Mei: Saturday at the ice rink' }, { base: 'video/noah-bike-park', title: 'Video 2 · Noah: at the bike park' }], videoCredit: 'Illustrated videos made for English Lab. Voices generated with ElevenLabs.' },
      chunks: ['Leo is winning, as usual', 'I usually ride here', 'I\'m filming a race'],
      fields: [
        { id: 'm1', label: { ca: 'Vídeo 1 (Mei): què està fent ara?', en: 'Video 1 (Mei): what is she doing now?' }, ph: 'She’s…', rows: 1 },
        { id: 'm2', label: { ca: 'Vídeo 1 (Mei): què fa normalment?', en: 'Video 1 (Mei): what does she usually do?' }, ph: 'She usually…', rows: 1 },
        { id: 'm3', label: { ca: 'Vídeo 1 (Mei): dos detalls (lloc, roba o temps)', en: 'Video 1 (Mei): two details (place, clothes or weather)' }, rows: 2 },
        { r: 'insecure', id: 'n1', label: { ca: 'Vídeo 2 (Noah): què està fent ara?', en: 'Video 2 (Noah): what is he doing now?' }, ph: 'He’s…', rows: 1 },
        { r: 'insecure', id: 'n2', label: { ca: 'Vídeo 2 (Noah): què fa normalment?', en: 'Video 2 (Noah): what does he usually do?' }, ph: 'He usually…', rows: 1 },
        { r: 'insecure', id: 'n3', label: { ca: 'Vídeo 2 (Noah): dos detalls (lloc, roba o temps)', en: 'Video 2 (Noah): two details (place, clothes or weather)' }, rows: 2 },
        { r: 'safe', id: 'how', label: 'Which words or images helped you understand what each vlogger is doing?', rows: 2 },
        { r: 'daring', id: 'cmp', label: 'Compare Mei and Noah: what is different today for each of them, and why?', rows: 2 }
      ],
      rate: {
        beginners: ['He mirat el vídeo 1 dues vegades', 'He escrit què fa ara i què fa normalment la Mei', 'He escrit dos detalls (lloc, roba o temps)'],
        insecure: ['He mirat cada vídeo dues vegades', 'He escrit què fa ara i què fa normalment cada persona', 'He escrit dos detalls de cada vídeo'],
        safe: ['I watched each video twice', 'I wrote what each vlogger is doing now and usually does', 'I wrote two details per video and said which words or images helped me'],
        daring: ['I watched each video twice', 'I wrote what each vlogger is doing now and usually does, with precise details', 'I compared the two vloggers']
      } },
    { id: 'shadow', type: 'shadow', tab: { ca: 'Shadowing', en: 'Shadowing' }, title: { ca: 'Shadowing · Mei: Saturday at the ice rink', en: 'Shadowing · Mei: Saturday at the ice rink' }, pill: '3 ×',
      intro: { ca: 'Repeteix un tros de l’escolta just darrere de la veu, com una ombra.', en: 'Repeat part of the listening just behind the speaker, like a shadow.' },
      clip: { title: 'Mei: Saturday at the ice rink', video: true, poster: 'video/mei-ice-rink-poster.jpg', src: 'video/mei-ice-rink.mp4', slow: 'video/mei-ice-rink-slow.mp4', t: [0.7, 28.35], ts: [0.7, 34.3], lines: [
        ['Mei', 'Hi everyone, I\'m Mei, and welcome to my Saturday vlog!'],
        ['Mei', 'Right now I\'m at the ice rink in the town square.'],
        ['Mei', 'It\'s December, so it\'s really cold, about three degrees, and it\'s cloudy.'],
        ['Mei', 'I\'m wearing a woolly hat, gloves and a big red jacket.'],
        ['Mei', 'Look! My brother Kai is skating behind me, and he\'s falling… again!'],
        ['Mei', 'I usually come here on Sunday afternoons with my family, just for fun.']], marks: [["**Hi**‿**ev**eryone, ↗ I'm **Mei**, ↗ and **wel**come to my **Sat**urday **vlog**! ↘"], ["**Right** **now** I'm‿at the **ice** **rink**‿in the **town** **square**. ↘"], ["It's De**cem**ber, ↗ so it's **real**ly **cold**, ↗ a**bout** **three** de**grees**, ↗ and‿it's **cloud**y. ↘"], ["I'm **wear**ing‿a **wool**ly **hat**, ↗ **gloves**‿and‿a **big** **red** **jack**et. ↘"], ["**Look**! ↘ My **broth**er **Kai**‿is **skat**ing be**hind** me, ↗ and he's **fall**ing… ↗ a**gain**! ↘"], ["I **us**ually **come** **here**‿on **Sun**day after**noons** with my **fam**ily, ↗ **just** for **fun**. ↘"]], cues: [[0.73, 4.64, 0.74, 5.25], [4.99, 7.79, 5.74, 8.94], [8.24, 13.92, 9.91, 16.52], [14.24, 17.77, 16.98, 21.18], [17.91, 23.75, 21.66, 28.43], [24.16, 28.19, 29.37, 33.99]] } },
    { id: 'grammar', type: 'typed', mode: 'listen', tab: { ca: 'Gramàtica', en: 'Grammar' }, title: { ca: 'Present Simple o Present Continuous?', en: 'Present Simple or Present Continuous?' }, pill: { ca: 'Respon-ho tot', en: 'Answer all' },
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
          { p: 'which', ca: head('🔁👀', 'Present Simple o Present Continuous?', 'Normalment (un hàbit) o ara mateix?') +
              row(card('blue', '🔁 Present Simple = HÀBITS', timeline([[10], [30], [50], [70], [90]], false, 'Passa una vegada i una altra.') +
                  ex('I usually <b>play</b> on Saturdays.') + ex('She <b>goes</b> skating every Sunday.', 'he / she → -s') + ex('We never <b>play</b> football in winter.') +
                  '<div>' + ['usually', 'always', 'never', 'every day', 'on Saturdays', 'in winter'].map(w => pill('blue', w)).join('') + '</div>', 280),
                card('orange', '👀 Present Continuous = ARA', timeline([[100, 'ara']], false, 'Passa en aquest moment.') +
                  ex('Today I<b>’m playing</b> inside.') + ex('Look! She<b>’s skating</b>.') + ex('Right now she<b>’s practising</b> her turns.') +
                  '<div>' + ['now', 'right now', 'at the moment', 'today', 'this weekend', 'Look!', 'Listen!'].map(w => pill('orange', w)).join('') + '</div>', 280)) +
              tip('Truc:', 'busca la paraula de temps. <em>every, usually, never</em> → Present Simple · <em>now, today, Look!</em> → Present Continuous.') +
              mistakes('Compte!', bad('I’m usually playing on Saturdays.', 'I usually <b>play</b> on Saturdays.'), bad('Look! She skates.', 'Look! She<b>’s skating</b>.'), bad('Mei come every Sunday.', 'Mei <b>comes</b> every Sunday.')) +
              together(true, ['Look! Ana ___ (skate).', '’s skating'], ['Ana ___ (skate) every Sunday.', 'skates']) +
              turn('Ara tu:', 'una cosa que fas normalment els dissabtes i una que estàs fent ara.'),
            en: head('🔁👀', 'Present Simple or Present Continuous?', 'Usually (a habit) or right now?') +
              row(card('blue', '🔁 Present Simple = HABITS', timeline([[10], [30], [50], [70], [90]], false, 'It happens again and again.') +
                  ex('I usually <b>play</b> on Saturdays.') + ex('She <b>goes</b> skating every Sunday.', 'he / she → -s') + ex('We never <b>play</b> football in winter.') +
                  '<div>' + ['usually', 'always', 'never', 'every day', 'on Saturdays', 'in winter'].map(w => pill('blue', w)).join('') + '</div>', 280),
                card('orange', '👀 Present Continuous = NOW', timeline([[100, 'now']], false, 'It is happening at this moment.') +
                  ex('Today I<b>’m playing</b> inside.') + ex('Look! She<b>’s skating</b>.') + ex('Right now she<b>’s practising</b> her turns.') +
                  '<div>' + ['now', 'right now', 'at the moment', 'today', 'this weekend', 'Look!', 'Listen!'].map(w => pill('orange', w)).join('') + '</div>', 280)) +
              tip('Trick:', 'look for the time word. <em>every, usually, never</em> → Present Simple · <em>now, today, Look!</em> → Present Continuous.') +
              mistakes('Watch out', bad('I’m usually playing on Saturdays.', 'I usually <b>play</b> on Saturdays.'), bad('Look! She skates.', 'Look! She<b>’s skating</b>.'), bad('Mei come every Sunday.', 'Mei <b>comes</b> every Sunday.')) +
              together(false, ['Look! Ana ___ (skate).', '’s skating'], ['Ana ___ (skate) every Sunday.', 'skates']) +
              turn('Your turn:', 'one thing you usually do on Saturdays and one thing you are doing now.') },
          { p: 'both', ca: head('↔️', 'Hàbit + ara en una sola frase', 'Uneix-les amb <b>but</b>: el que fas normalment, però avui és diferent.') +
              table([['🔁 Normalment (Present Simple)', 'but', '👀 Avui / ara (Present Continuous)'], ['I usually <b>go</b> swimming,', 'but', 'today I<b>’m watching</b> a match.'], ['I usually <b>wear</b> trainers,', 'but', 'today I<b>’m wearing</b> boots.'], ['Noah usually <b>rides</b> his bike,', 'but', 'today he<b>’s filming</b>.']]) +
              together(true, ['I usually ___ (walk) to school, but today I ___ (go) by bus.', 'walk · ’m going']) +
              turn('Ara tu:', 'escriu una frase com aquestes sobre tu: <em>I usually…, but today I’m…</em>'),
            en: head('↔️', 'Habit + now in one sentence', 'Join them with <b>but</b>: what you usually do, but today is different.') +
              table([['🔁 Usually (Present Simple)', 'but', '👀 Today / now (Present Continuous)'], ['I usually <b>go</b> swimming,', 'but', 'today I<b>’m watching</b> a match.'], ['I usually <b>wear</b> trainers,', 'but', 'today I<b>’m wearing</b> boots.'], ['Noah usually <b>rides</b> his bike,', 'but', 'today he<b>’s filming</b>.']]) +
              together(false, ['I usually ___ (walk) to school, but today I ___ (go) by bus.', 'walk · ’m going']) +
              turn('Your turn:', 'write a sentence like these about you: <em>I usually…, but today I’m…</em>') },
          { p: 'state', r: 'safe', en: head('🧠', 'State verbs: no -ing, even now', 'They are about what you think, feel, want or know, not actions you can see.') +
              '<div>' + ['like', 'love', 'hate', 'want', 'need', 'know', 'prefer', 'understand', 'believe', 'mean'].map(w => pill('purple', w)).join('') + '</div>' +
              row(card('red', '✗ Not with -ing', ex('<del>I’m wanting a new helmet.</del>') + ex('<del>Are you knowing the rules?</del>')), card('green', '✓ Present Simple', ex('I <b>want</b> a new helmet now.') + ex('<b>Do</b> you <b>know</b> the rules?') + ex('I <b>don’t understand</b> this exercise.'))) +
              mistakes('Watch out', bad('I’m needing new gloves.', 'I <b>need</b> new gloves.')) +
              together(false, ['I ___ (need) a new pen right now.', 'need'], ['She ___ (know) the answer.', 'knows']) +
              turn('Your turn:', 'three sentences about you right now with <em>want, need</em> and <em>know</em>.') },
          { p: 'temp', r: 'daring', en: head('⏳', 'For a while, and the two meanings of <em>think</em>') +
              row(card('blue', '⏳ Present Continuous for TEMPORARY things', ex('This month I<b>’m training</b> for a race.') + ex('My cousin <b>is living</b> with us this year.') + small('True for a limited time, not only this second.')),
                card('purple', '🤔 think: opinion or activity?', ex('I <b>think</b> skating is great.', 'opinion → Present Simple') + ex('I<b>’m thinking</b> about my next video.', 'an activity now → continuous'))) +
              mistakes('Watch out', bad('I’m thinking skating is great.', 'I <b>think</b> skating is great.'), bad('Leo is knowing all the routes.', 'Leo <b>knows</b> all the routes.')) +
              together(false, ['This week my aunt ___ (stay) with us.', 'is staying'], ['I ___ (think) it’s a good idea.', 'think']) +
              turn('Your turn:', 'something you are doing this month (not now) and your opinion about it with <em>I think…</em>') }
        ];
      })(),
      // blocks, 4 compulsory each (3 + … or 4 questions), the rest ➕ extra practice (Roger, 13 Nov 2026: "not about volume but quality")
      req: 4,
      parts: [
        { id: 'which', title: { ca: 'Present Simple o Continuous?', en: 'Present Simple or Continuous?' }, note: { ca: 'Hàbit (<em>usually, every…</em>) → Present Simple · ara (<em>now, today, Look!</em>) → Present Continuous', en: 'Habit (<em>usually, every…</em>) → Present Simple · now (<em>now, today, Look!</em>) → Present Continuous' } },
        { id: 'both', title: { ca: 'Hàbit + ara', en: 'Habit + now' }, note: { ca: '<em>I usually…, but today I’m…</em>', en: '<em>I usually…, but today I’m…</em>' } },
        { id: 'state', title: { en: 'State verbs' }, note: { en: '<em>want, need, know, like, prefer, understand…</em> → no -ing' } },
        { id: 'temp', title: { en: 'For a while · think' }, note: { en: '<em>This month I’m training</em> · <em>I think…</em> (opinion) / <em>I’m thinking about…</em> (activity)' } }
      ],
      items: [
        { p: 'which', q: 'I usually ___ (go) swimming on Saturdays.', a: ['go'], ca: 'usually → hàbit.', en: 'usually → habit.' },
        { p: 'which', q: 'Today I ___ (watch) my sister’s match.', a: ['am watching', "'m watching"], ca: 'today → ara.', en: 'today → now.' },
        { p: 'which', q: 'Mei ___ (come) to the rink every Sunday.', a: ['comes'], ca: 'every Sunday → hàbit, 3a persona.', en: 'every Sunday → habit, third person.' },
        { p: 'which', q: 'Right now she ___ (practise) her turns.', a: ['is practising', "'s practising", 'is practicing', "'s practicing"], ca: 'right now → ara.', en: 'right now → now.' },
        { p: 'which', q: 'Listen! Somebody ___ (play) the guitar.', a: ['is playing', "'s playing"], ca: 'Listen! → ara.', en: 'Listen! → now.' },
        { p: 'which', q: 'We never ___ (play) football in winter.', a: ['play'], ca: 'never → hàbit.', en: 'never → habit.' },
        { p: 'which', q: 'In summer we ___ (swim) in the sea every day.', a: ['swim'], ca: 'every day → hàbit.', en: 'every day → habit.' },
        { p: 'which', r: 'insecure', q: 'Noah ___ (not / ride) today: he’s filming.', a: ["isn't riding", 'is not riding', "'s not riding"], ca: 'today → Present Continuous negatiu.', en: 'today → Present Continuous negative.' },
        { p: 'which', r: 'insecure', q: '___ you usually ___ (train) on Tuesdays? — Yes, we do.', a: ['do train'], ca: 'Pregunta d’hàbit: Do you train…?', en: 'Habit question: Do you train…?' },
        { p: 'which', r: 'insecure', q: 'What ___ Kai ___ (do) at the moment? — He’s falling!', a: ['is doing'], ca: 'at the moment → ara.', en: 'at the moment → now.' },
        { p: 'which', r: 'insecure', q: 'My dad ___ (not / like) cold weather, so he stays at home in winter.', a: ["doesn't like", 'does not like'], ca: 'Hàbit/general: doesn’t like.', en: 'General: doesn’t like.' },
        { p: 'which', a: [], own: { must: ["\\b(am|is|are|['’]m|['’]s|['’]re)\\s+\\w+ing\\b"], min: 10 }, q: "Your turn: one thing you usually do on Saturdays and one thing you are doing now. <span class=\"tiny\">(Una cosa que fas normalment els dissabtes i una que estàs fent ara.)</span>", show: "I usually play football on Saturdays. Now I’m doing my English homework.", ca: "Normalment → Present Simple · ara → am / is / are + -ing.", en: "Usually → Present Simple · now → am / is / are + -ing." },
        { p: 'both', q: 'I usually wear trainers, but today I ___ (wear) boots.', a: ['am wearing', "'m wearing"], ca: 'today → ara.', en: 'today → now.' },
        { p: 'both', r: 'safe', q: 'Leo usually wins, and he ___ (win) again today!', a: ['is winning', "'s winning"], en: 'today → now → is winning.' },
        { p: 'both', a: [], own: { must: ["\\busually\\b", "\\bbut\\b", "\\b(am|is|are|['’]m|['’]s|['’]re)\\s+\\w+ing\\b"], min: 8 }, q: "Your turn: write a sentence like these about you: <em>I usually…, but today I’m…</em> <span class=\"tiny\">(Una frase sobre tu: I usually…, but today I’m…)</span>", show: "I usually walk to school, but today I’m going by bus.", ca: "I usually + verb, but today I’m + -ing.", en: "I usually + verb, but today I’m + -ing." },
        { p: 'state', r: 'safe', q: 'I ___ (want) a new helmet. Mine is too small. (state verb)', a: ['want'], en: 'State verb: never continuous.' },
        { p: 'state', r: 'safe', q: '___ you ___ (know) the rules of this game?', a: ['do know'], en: 'know → Present Simple: Do you know…?' },
        { p: 'state', r: 'safe', q: 'She ___ (prefer) skating to cycling.', a: ['prefers'], en: 'State verb, third person.' },
        { p: 'state', r: 'safe', q: 'I ___ (not / understand) this exercise. Can you help me?', a: ["don't understand", 'do not understand'], en: 'State verb: don’t understand.' },
        { p: 'state', r: 'safe', q: 'Correct the mistake: “I’m needing new gloves.” → I ___ new gloves.', a: ['need'], en: 'need is a state verb.' },
        { p: 'state', r: 'safe', a: [], own: { must: ["\\bwant", "\\bneed", "\\bknow"], min: 12 }, q: "Your turn: three sentences about you right now with <b>want</b>, <b>need</b> and <b>know</b>.", show: "I want a sandwich. I need a new pen. I know the answer.", en: "want / need / know: never with -ing." },
        { p: 'temp', r: 'daring', q: 'This month I ___ (train) for a race, so I ride every day.', a: ['am training', "'m training"], en: 'Temporary situation: this month.' },
        { p: 'temp', r: 'daring', q: 'My cousin ___ (stay) with us this week, so we go skating together every afternoon.', a: ['is staying', "'s staying"], en: 'Temporary: this week.' },
        { p: 'temp', r: 'daring', q: 'I ___ (think) skating is more fun than cycling. (opinion)', a: ['think'], en: 'Opinion: think, no continuous.' },
        { p: 'temp', r: 'daring', q: 'Be quiet, please! I ___ (think) about my next video.', a: ['am thinking', "'m thinking"], en: 'An activity now: I’m thinking about…' },
        { p: 'temp', r: 'daring', q: 'Correct the mistake: “Leo is knowing all the routes in the park.” → Leo ___ all the routes.', a: ['knows'], en: 'know is a state verb.' },
        { p: 'temp', r: 'daring', a: [], own: { must: ["\\b(am|is|are|['’]m|['’]s|['’]re)\\s+\\w+ing\\b", "\\bI think\\b"], min: 10 }, q: "Your turn: something you are doing this month (not now) and your opinion about it with <b>I think…</b>", show: "I’m learning to skate this month. I think it’s really fun.", en: "am / is / are + -ing for this month · I think + Present Simple." }
      ] },
    { id: 'mixed', type: 'typed', mode: 'say', tab: { ca: 'Barreja', en: 'Mixed' }, title: { ca: 'Pràctica barrejada', en: 'Mixed practice: choose the form' }, pill: { ca: 'Respon-ho tot', en: 'Answer all' },
      intro: { ca: 'Barreja de formes de les LS1 i LS2: decideix primer quina necessites.', en: 'Mixed forms from LS1 and LS2: decide which one you need first.' },
      items: [
        { q: 'She ___ (have) got a new bike.', a: ['has'] },
        { q: 'Look! It ___ (rain).', a: ['is raining', "'s raining"] },
        { q: 'I ___ karate on Tuesdays. (fer)', a: ['do'] },
        { r: 'insecure', q: 'We ___ (not / go) to school on Sundays.', a: ["don't go", 'do not go'] },
        { q: 'Write the -ing form: run → ___', a: ['running'] },
        { q: 'It’s very ___ today: 2 degrees! (fred)', a: ['cold'] },
        { r: 'safe', q: 'How ___ do you train? — Twice a week.', a: ['often'] },
        { r: 'safe', q: 'I ___ (not / want) to go out: it’s freezing.', a: ["don't want", 'do not want'] },
        { r: 'daring', q: 'Who ___ (film) the race today? — Noah is.', a: ['is filming', "'s filming"] },
        { r: 'daring', q: 'I ___ (believe) she can win the show. (state verb)', a: ['believe'] }
      ] },
    { id: 'write', type: 'writing', product: 2, tab: { ca: 'Escriptura', en: 'Writing' }, title: { ca: 'Peça 2: normalment… però avui…', en: 'Piece 2: usually… but today…' },
      intro: { ca: 'Escriu un moment “en directe” del teu vlog: què fas normalment en el teu temps lliure i què està passant avui. És la segona peça del teu vlog.', en: 'Write a “live” moment of your vlog: what you usually do in your free time and what is happening today. This is the second piece of your vlog.' },
      task: { beginners: 'Escriu 40–55 paraules amb la pauta: on ets, quin temps fa, què fas normalment (una frase amb <em>usually</em>) i què està passant avui (una frase amb <em>today</em> i <em>is / are + -ing</em>). Canvia només les paraules que calgui.', insecure: 'Escriu 50–70 paraules: on ets, quin temps fa, què fas normalment (dues frases amb Present Simple i <em>usually</em>) i què està passant avui (dues frases amb Present Continuous i <em>today / right now</em>). Afegeix una expressió de temps a cada frase.', safe: 'Write 70–90 words as a live vlog moment: where you are and the weather, what you usually do there and when (Present Simple), what is different today (Present Continuous), what you are wearing or using, and one thing you want or need (state verb).', daring: 'Write 90–120 words as a live vlog moment: where you are and the weather, your usual routine there, what is happening right now, and one temporary situation this month (<em>This month I’m…</em>). Include a state verb, time expressions and <em>and, but, because, so</em>.' },
      frame: { beginners: '<strong>Pauta:</strong> Hi! Right now I’m at ___. It’s ___. I usually ___ here on ___. But today ___ is ___-ing. I’m ___-ing too. I’m wearing ___.<br><strong>Paraules:</strong> the park · the beach · the sports centre · sunny · cold · raining · play football · go swimming · Saturdays · Sundays · my friend · playing · watching · a jacket · a cap', insecure: '<strong>Pauta:</strong> Hi! Right now I’m at ___. It’s ___. I usually ___ here on ___. I always ___. But today ___ is ___-ing and I’m ___-ing. I’m wearing ___.' },
      model: { ca: 'Hi! Right now I’m at the sports centre. It’s cold and rainy. I usually go swimming here on Saturday mornings. I always swim for an hour. But today the pool is closed, so I’m watching my sister’s match. She’s playing basketball. I’m wearing my big jacket!', en: 'Hi everyone! Right now I’m at the sports centre, and it’s cold and rainy outside. I usually go swimming here on Saturday mornings, and I always swim for an hour. But today the pool is closed, so I’m watching my sister’s basketball match. She’s wearing the white uniform, number seven, and she’s playing really well. I need a hot chocolate!' },
      min: { beginners: 40, insecure: 50, safe: 70, daring: 90 },
      checklist: { beginners: ['Una frase amb usually', 'Una frase amb today i is / are + -ing', 'Quin temps fa i on ets', 'He seguit la pauta'], insecure: ['Dues frases amb Present Simple i usually / always', 'Dues frases amb Present Continuous i today / right now', 'Quin temps fa i on ets', 'Una expressió de temps a cada frase'], safe: ['Present Simple for the usual routine, with a time expression', 'Present Continuous for today, with a time expression', 'The weather and the clothes or kit', 'A state verb (want, need, like, prefer…) in the Present Simple'], daring: ['Present Simple vs Present Continuous used correctly', 'One temporary situation (this month…)', 'A state verb in the Present Simple', 'and / but / because / so'] } },
    { id: 'speak', type: 'speaking', tab: 'Speaking', title: { ca: 'Speaking: en directe', en: 'Speaking: live!' },
      intro: { ca: 'Grava’t com si fos un vlog en directe. Mira les notes, no llegeixis.', en: 'Record yourself as if it were a live vlog. Use notes; don’t read.' },
      task: { beginners: 'Digues on ets, quin temps fa, què fas normalment i què està passant avui (tres o quatre frases amb el model, 20–30 segons).', insecure: 'Digues on ets, quin temps fa, què fas normalment i què està passant avui (quatre o cinc frases, 25–35 segons).', safe: 'Report live: where you are, the weather, what you usually do there and what is happening right now; say one thing you want or need (40–60 s).', daring: 'Report live and add a temporary situation this month and why today is special; use at least one state verb (60–90 s).' },
      model: { beginners: 'Hi! I’m at the park. It’s sunny. I usually play football here. Today I’m watching my friends.', insecure: 'Hi! I’m at the park. It’s sunny. I usually play football here. Today I’m not playing: I’m watching my friends.', safe: 'Hi everyone! Right now I’m at the ice rink. It’s really cold, about three degrees. I usually come here on Sunday afternoons with my family, but today I’m training for a show, so I’m practising my turns. I need a hot drink!', daring: 'Hey, what’s up? I’m at the bike park and it’s sunny and windy, perfect for riding. I usually ride here with my dad on Sunday mornings, but this month I’m training for a race, so I come every day. Right now I’m not riding: I’m filming my friends, because we want a video for our channel. I think Leo is winning again!' } },
    { id: 'talk', type: 'talk', tab: { ca: 'Conversa', en: 'Talk' }, title: { ca: 'Conversa: ara o normalment?', en: 'Talk: now or usually?' },
      intro: { ca: 'Un company de classe et pregunta pel teu cap de setmana.', en: 'A classmate asks you about your weekend.' },
      task: { beginners: 'Respon amb frases curtes: I usually… / This weekend I’m…', insecure: 'Respon amb frases completes: el Present Simple per al que fas normalment i el Present Continuous per al que fas aquest cap de setmana.', safe: 'Answer in two or three sentences. Contrast what you usually do with what you are doing this weekend: usually, every…, today, this weekend.', daring: 'Answer in detail, contrast habits and now, and explain why this weekend is different.' },
      partner: [
        { q: 'What do you usually do on Saturdays?', ca: 'Què fas normalment els dissabtes?' },
        { q: 'What are you doing this weekend?', ca: 'Què fas aquest cap de setmana?' },
        { q: 'Do you usually do sport?', ca: 'Fas esport normalment?' },
        { r: 'insecure', q: 'Who do you usually go out with?', ca: 'Amb qui surts normalment?' },
        { r: 'safe', q: 'How often do you see your friends?' },
        { r: 'safe', q: 'Why is this weekend different?' },
        { r: 'daring', q: 'Which do you prefer, your usual weekend or this one? Why?' }
      ],
      model: { beginners: 'I usually play basketball on Saturdays. This weekend I’m visiting my grandmother. Yes, I play basketball.', insecure: 'I usually play basketball on Saturday mornings. This weekend I’m visiting my grandmother in Girona. Yes, I do sport three times a week. I usually go out with my cousins.', safe: 'I usually play basketball on Saturday mornings and then I meet my friends in the square. But this weekend I’m visiting my grandmother in Girona, because it’s her birthday. I see my friends every day at school and almost every weekend.', daring: 'On Saturdays I usually have a basketball match in the morning, and in the afternoon I hang out with my friends in the square. This weekend is different: I’m not playing, because I’m visiting my grandmother in Girona for her eightieth birthday. My cousins are coming too, and we’re cooking a big lunch. I prefer my usual weekend because I love the matches, but this one is special.' } }
  ]
};
