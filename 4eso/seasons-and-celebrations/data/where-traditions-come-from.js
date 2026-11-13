/* LS2 · Learning Path 3 · Where traditions come from (approved content, docs/4eso/ls2-seasons-and-celebrations/overview.md) */
window.LP = {
  key: 'ls2Traditions4ESO', n: 3, starter: true, title: 'Where traditions come from',
  panels: [
    { id: 'recall', type: 'recall', tab: 'Recall', title: { ca: 'Recall: Learning Paths 1 i 2', en: 'Recall: Learning Paths 1 and 2' }, pill: { ca: 'Sense apunts', en: 'No notes' },
      intro: { ca: 'Escriu les respostes sense mirar res.', en: 'Type the answers without looking.' },
      items: [
        { q: 'A Jewish festival of eight nights: ___', a: ['Hanukkah', 'Chanukah'] },
        { q: 'Small oil lamps at Diwali: ___', a: ['diyas'] },
        { q: 'The Castanyada is held ___ 31 October.', a: ['on'], ca: 'Data → on.', en: 'Date → on.' },
        { q: 'Children ___ (dress) up at Halloween.', a: ['dress'] },
        { r: 'insecure', q: 'At Lunar New Year, families ___ together for a big reunion dinner.', a: ['get'] },
        { r: 'insecure', q: 'Not hot, not cold: ___', a: ['mild'] },
        { r: 'safe', q: 'Families ___ gifts at Diwali.', a: ['exchange'] },
        { r: 'safe', q: 'The opposite of religious: ___', a: ['secular'] },
        { r: 'daring', q: 'People exchange gifts. → Gifts ___ ___.', a: ['are exchanged'] },
        { r: 'daring', q: 'To remember and honour an important event: to c___', a: ['commemorate'] }
      ] },
    { id: 'vocab', type: 'vocab', practiceMode: 'listen', tab: { ca: 'Vocabulari', en: 'Vocabulary' }, title: { ca: 'Dates, comparar i canviar', en: 'Dates, comparing and change' },
      intro: { ca: 'Explora, practica amb les targetes i completa les frases.', en: 'Explore, practise with the cards and complete the sentences.' },
      receptive: 'pilgrims · feast · harvest festival',
      core: { beginners: ['on 31 October', 'in November', 'at Christmas', 'at night', 'every year', 'excited', 'exciting', 'bored', 'boring', 'tired', 'tiring'], insecure: ['on 31 October', 'in November', 'at Christmas', 'at night', 'every year', 'once a year', 'the night before', 'the first', 'the twenty-fifth', 'excited', 'exciting', 'bored', 'boring', 'interested (in)', 'interesting', 'tired', 'tiring', 'amazed', 'amazing', 'disappointed', 'disappointing'], safe: ['on 31 October', 'in November', 'at Christmas', 'every year', 'once a year', 'the night before', 'the first', 'the twenty-fifth', 'both… and…', 'similar to', 'different from', 'whereas', 'in the same way', 'unlike', 'travel home for the holidays', 'the town square', 'the community centre', 'crowded streets', 'contribute to', 'depend on', 'come from', 'be known for', 'be associated with', 'interested (in)', 'interesting', 'amazed', 'amazing', 'surprised', 'surprising', 'disappointed', 'disappointing'], daring: ['once a year', 'the night before', 'both… and…', 'similar to', 'different from', 'whereas', 'unlike', 'commercialised', 'consumerism', 'keep a tradition alive', 'die out', 'evolve', 'adapt', 'date back to', 'stereotype', 'inclusive', 'take something for granted', 'contribute to', 'depend on', 'be associated with', 'surprised', 'surprising', 'disappointed', 'disappointing'] },
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
          { ca: head('📆', 'Dates: <em>in</em>, <em>on</em> o <em>at</em>?', 'Pensa en un zoom: de molt de temps (<b>in</b>) a un dia (<b>on</b>) a un moment o una festa (<b>at</b>).') +
              scale([['blue', '🗓 IN', 'mes · estació · any'], ['purple', '📆 ON', 'dia · data'], ['orange', '⏰ AT', 'nit · hora · període de festa']]) +
              row(card('blue', 'IN', ex('Thanksgiving is <b>in</b> November.') + ex('Diwali is <b>in</b> autumn.'), 180),
                card('purple', 'ON', ex('The Castanyada is <b>on</b> 31 October.') + ex('Thanksgiving is <b>on</b> the fourth Thursday.'), 180),
                card('orange', 'AT', ex('We get together <b>at</b> Christmas.') + ex('The fireworks are <b>at</b> night.'), 180)) +
              row(card('teal', '🔁 Sense preposició', ex('We celebrate it <b>every year</b>.', 'cada any') + ex('It happens <b>once a year</b>.', 'un cop l’any') + ex('We prepare <b>the night before</b>.', 'la nit abans'))) +
              mistakes('Compte!', bad('in 31 October', '<b>on</b> 31 October'), bad('on Christmas', '<b>at</b> Christmas'), bad('in every year', '<b>every</b> year', '(every: sense preposició)')) +
              together(true, ['Thanksgiving is ___ November. The Castanyada is ___ 31 October. We eat turrón ___ Christmas.', 'in · on · at']) +
              turn('Ara tu:', 'quan és la teva festa preferida? Digues-ho amb <em>in, on</em> o <em>at</em>.'),
            en: head('📆', 'Dates: <em>in</em>, <em>on</em> or <em>at</em>?', 'Think of a zoom: from a long time (<b>in</b>) to one day (<b>on</b>) to a moment or a holiday (<b>at</b>).') +
              scale([['blue', '🗓 IN', 'month · season · year'], ['purple', '📆 ON', 'day · date'], ['orange', '⏰ AT', 'night · clock time · holiday time']]) +
              row(card('blue', 'IN', ex('Thanksgiving is <b>in</b> November.') + ex('Diwali is <b>in</b> autumn.'), 180),
                card('purple', 'ON', ex('The Castanyada is <b>on</b> 31 October.') + ex('Thanksgiving is <b>on</b> the fourth Thursday.'), 180),
                card('orange', 'AT', ex('We get together <b>at</b> Christmas.') + ex('The fireworks are <b>at</b> night.'), 180)) +
              row(card('teal', '🔁 No preposition', ex('We celebrate it <b>every year</b>.') + ex('It happens <b>once a year</b>.') + ex('We prepare <b>the night before</b>.'))) +
              mistakes('Watch out', bad('in 31 October', '<b>on</b> 31 October'), bad('on Christmas', '<b>at</b> Christmas'), bad('in every year', '<b>every</b> year', '(every: no preposition)')) +
              together(false, ['Thanksgiving is ___ November. The Castanyada is ___ 31 October. We eat turrón ___ Christmas.', 'in · on · at']) +
              turn('Your turn:', 'when is your favourite celebration? Say it with <em>in, on</em> or <em>at</em>.') },
          { r: 'safe', en: head('🔗', 'Verb + preposition and comparing words', 'The preposition is fixed: learn it with the word.') +
              row(card('blue', 'Verb + preposition', table([['Word', 'Example'], ['contribute <b>to</b>', 'Everyone <b>contributes to</b> the party.'], ['depend <b>on</b>', 'The date <b>depends on</b> the moon.'], ['come <b>from</b>', 'Halloween <b>comes from</b> Samhain.'], ['be known <b>for</b>', 'Leicester <b>is known for</b> its Diwali lights.'], ['be associated <b>with</b>', 'Pumpkins <b>are associated with</b> Halloween.']]), 300),
                card('green', 'Comparing', table([['Word', 'Example'], ['similar <b>to</b>', 'It’s <b>similar to</b> a harvest festival.'], ['different <b>from</b>', 'It’s <b>different from</b> Christmas.'], ['<b>both</b> … <b>and</b> …', '<b>Both</b> Diwali <b>and</b> Hanukkah use lights.'], ['<b>unlike</b> + noun', '<b>Unlike</b> Halloween, it’s at home.']]), 300)) +
              mistakes('Watch out', bad('It depends of the moon.', 'It depends <b>on</b> the moon.'), bad('similar than', 'similar <b>to</b>'), bad('known by its lights', 'known <b>for</b> its lights')) +
              together(false, ['It depends ___ the weather.', 'on'], ['Halloween comes ___ Samhain.', 'from']) +
              turn('Your turn:', 'one sentence with <em>comes from</em> and one with <em>is known for</em> about a celebration you know.') }
        ];
      })(),
      groups: [
        { g: 'Dates & time', items: [['on 31 October', 'el 31 d’octubre', 'The Castanyada is on 31 October.'], ['in November', 'al novembre', 'Thanksgiving is in November.'], ['at Christmas', 'per Nadal', 'We get together at Christmas.'], ['at night', 'a la nit', 'The fireworks are at night.'], ['every year', 'cada any', 'We celebrate it every year.'], ['once a year', 'un cop l’any', 'It happens once a year.'], ['the night before', 'la nit abans', 'We decorate the night before.'], ['the first', 'el primer (dia 1)', 'on the first of November'], ['the twenty-fifth', 'el vint-i-cinc', 'on the twenty-fifth of December']] },
        { r: 'safe', g: 'Comparing cultures (Safe)', items: [['both… and…', 'tant… com…', 'Both Diwali and Hanukkah use lights.'], ['similar to', 'semblant a', 'It’s similar to a harvest festival.'], ['different from', 'diferent de', 'It’s different from Christmas.'], ['whereas', 'mentre que', 'Halloween is about costumes, whereas the Castanyada is about family.'], ['in the same way', 'de la mateixa manera', 'In the same way, we eat together.'], ['unlike', 'a diferència de', 'Unlike Hanukkah, Diwali lasts five days.']] },
        { r: 'safe', g: 'Places & travel (Safe)', items: [['travel home for the holidays', 'tornar a casa per les festes', 'Many people travel home for the holidays.'], ['the town square', 'la plaça del poble', 'The parade ends in the town square.'], ['the community centre', 'el centre cívic', 'There’s a party at the community centre.'], ['the school hall', 'la sala d’actes de l’escola', 'The event is in the school hall.'], ['crowded streets', 'carrers plens de gent', 'At Christmas there are crowded streets.']] },
        { r: 'daring', g: 'Change & debate (Daring)', items: [['commercialised', 'comercialitzat', 'Halloween is very commercialised.'], ['consumerism', 'consumisme', 'Some people criticise consumerism at Christmas.'], ['keep a tradition alive', 'mantenir viva una tradició', 'Schools keep the tradition alive.'], ['die out', 'desaparèixer', 'Some customs die out.'], ['evolve', 'evolucionar', 'Traditions evolve.'], ['adapt', 'adaptar(-se)', 'People adapt old customs.'], ['reinvent', 'reinventar', 'Young people reinvent traditions.'], ['date back to', 'remuntar-se a', 'It dates back to the 1600s.'], ['cultural appropriation', 'apropiació cultural', 'Wearing sacred symbols as a costume can be cultural appropriation.'], ['stereotype', 'estereotip', 'Avoid stereotypes.'], ['inclusive', 'inclusiu', 'An inclusive event.'], ['take something for granted', 'donar per fet', 'We take our traditions for granted.']] },
        { r: 'safe', g: 'Verb + preposition (Safe)', items: [['contribute to', 'contribuir a', 'Everyone contributes to the meal.'], ['depend on', 'dependre de', 'The date depends on the moon.'], ['come from', 'venir de', 'Halloween comes from Samhain.'], ['be known for', 'ser conegut per', 'Leicester is known for its Diwali lights.'], ['be associated with', 'estar associat a', 'Pumpkins are associated with Halloween.']] },
        /* Feelings -ed / -ing (Roger, 9 Nov 2026: the lexicon map plans "Sentiments i emocions (adjectius -ed / -ing)" in 4 ESO LS2; the
           feelings words were in LP1, the -ed / -ing contrast nowhere). -ed = how you feel, -ing = what the thing is like. */
        { g: 'Feelings: -ed = how you feel · -ing = what it is like', items: [['excited', 'il·lusionat/da (com em sento)', 'The children are excited about the fireworks.'], ['exciting', 'emocionant', 'The fireworks are exciting.'], ['bored', 'avorrit/da (com em sento)', 'I’m bored: the speech is too long.'], ['boring', 'avorrit/da, pesat/da (com és una cosa)', 'The speech is boring.'], ['tired', 'cansat/da', 'After the parade, we’re tired.'], ['tiring', 'cansat/da, esgotador/a (que cansa)', 'Dancing all night is tiring.']] },
        { r: 'insecure', g: 'More feelings: -ed or -ing?', items: [['interested (in)', 'interessat/da (en)', 'I’m interested in old traditions.'], ['interesting', 'interessant', 'The story of Halloween is interesting.'], ['amazed', 'meravellat/da', 'We were amazed by the Diwali lights.'], ['amazing', 'increïble, meravellós/osa', 'The Diwali lights are amazing.'], ['disappointed', 'decebut/uda', 'I was disappointed: it rained all day.'], ['disappointing', 'decebedor/a', 'The weather was disappointing.']] },
        { r: 'safe', g: 'Feelings: surprised or surprising?', items: [['surprised', 'sorprès/esa', 'She was surprised by the presents.'], ['surprising', 'sorprenent', 'It’s surprising that pumpkins were once turnips!']] }
      ],
      review: [
        { g: 'Learning Path 2', items: [['celebrate', 'celebrar', 'We celebrate it every year.'], ['relatives', 'familiars', 'We visit our relatives.'], ['parade', 'desfilada', 'There’s a parade.'], ['dress up', 'disfressar-se', 'Children dress up.']] },
        { r: 'safe', g: 'Learning Path 2', items: [['get together', 'reunir-se', 'Families get together.'], ['secular', 'laic', 'A secular holiday.']] },
        { r: 'daring', g: 'Learning Path 2', items: [['heritage', 'herència cultural', 'Our cultural heritage.']] }
      ],
      practice: [
        { q: 'Thanksgiving is ___ November.', a: ['in'] },
        { q: 'We celebrate the Castanyada ___ 31 October.', a: ['on'] },
        { q: 'We get together ___ Christmas.', a: ['at'] },
        { r: 'insecure', q: '25/12 → on the ___ of December', a: ['twenty-fifth', 'twenty fifth', '25th'] },
        { r: 'insecure', q: '1/11 → on the ___ of November', a: ['first', '1st'] },
        { q: 'We celebrate it ___ a year, in spring.', a: ['once'] },
        { q: 'The Castanyada is on the night ___ All Saints’ Day.', a: ['before'] },
        { r: 'safe', q: 'Diwali is ___ from Christmas in many ways.', a: ['different'] },
        { r: 'safe', q: '___ Halloween and the Castanyada take place on 31 October.', a: ['both'] },
        { r: 'safe', q: 'At Christmas the ___ streets are full of people.', a: ['crowded'] },
        { r: 'daring', q: 'Halloween ___ back to an old Celtic festival.', a: ['dates'] },
        { r: 'daring', q: 'Some people think Christmas is too ___: it’s all about buying things.', a: ['commercialised', 'commercialized'] },
        { r: 'safe', q: 'Spain is known ___ its summer festivals.', a: ['for'] }
      ] },
    { id: 'listen', type: 'mc', tab: 'Listening', title: 'Listening: The story behind two autumn celebrations', pill: { ca: 'Pòdcast', en: 'Podcast' },
      intro: { ca: 'Escolta el pòdcast una vegada per saber de quines dues festes parla. Després llegeix les preguntes i torna’l a escoltar.', en: 'Listen once to find the two celebrations. Then read the questions and listen again.' },
      media: { audio: 'audio/culture-bites-origins.mp3', title: 'Culture Bites: the story behind two autumn celebrations', script: [
        ['Emma', 'Welcome back to Culture Bites. Today: where do two famous autumn celebrations come from? Let’s start with Halloween.'],
        ['Sam', 'Halloween comes from an old Celtic festival called Samhain. It took place in Ireland and Scotland more than two thousand years ago, at the end of the harvest and the start of winter.'],
        ['Emma', 'And people believed that on that night, the spirits of the dead came back.'],
        ['Sam', 'Exactly. So people used to light bonfires and wear masks to hide from the spirits. And here’s a surprise: they didn’t use pumpkins. They used to carve turnips!'],
        ['Emma', 'Turnips? So where do the pumpkins come from?'],
        ['Sam', 'In the 1800s, many Irish people moved to the United States. Pumpkins were bigger and easier to carve, so the tradition changed.'],
        ['Emma', 'Now, Thanksgiving. It takes place on the fourth Thursday of November, and this year that’s the twenty-sixth.'],
        ['Sam', 'The story usually starts in 1621. A group of English settlers, the Pilgrims, had a harvest feast with the Wampanoag people, who lived in the area. It lasted three days.'],
        ['Emma', 'But it didn’t become a national holiday until 1863, when President Abraham Lincoln made it official.'],
        ['Sam', 'Today families travel home, get together and share a big meal, usually with turkey. Many people say what they are grateful for.'],
        ['Emma', 'It’s important to remember that not everybody sees the story in the same way. For some Native Americans, it is a day of mourning, a day to remember what they lost.'],
        ['Sam', 'So both celebrations started as harvest festivals, but they have changed a lot over time.'],
        ['Emma', 'That’s all for today. Happy holidays!']] },
      chunks: ['They used to carve turnips', 'on the fourth Thursday of November', 'who lived in the area'],
      items: [
        { q: 'Where did Samhain take place?', o: ['Ireland and Scotland', 'the United States', 'England'], h: 'Escolta el principi: on va començar Samhain?' },
        { q: 'What did people use to carve?', o: ['turnips', 'pumpkins', 'apples'], h: 'És una sorpresa: no eren carbasses.' },
        { q: 'Why did the tradition change in the USA?', o: ['Pumpkins were bigger and easier to carve.', 'Turnips were expensive.', 'People didn’t like turnips.'], h: 'Escolta què diu de les carbasses: com eren?' },
        { r: 'insecure', q: 'When is Thanksgiving this year?', o: ['26 November', '21 November', '1 December'], h: 'Escolta “this year that’s the…”.' },
        { q: 'How long did the 1621 feast last?', o: ['three days', 'one day', 'a week'], h: 'Escolta “It lasted…”.' },
        { q: 'What do many families eat at Thanksgiving?', o: ['turkey', 'chestnuts', 'pumpkin soup'], h: 'Escolta “a big meal, usually with…”.' },
        { r: 'safe', q: 'When did Thanksgiving become a national holiday?', o: ['1863', '1621', '1800'] },
        { r: 'safe', q: 'What do the two celebrations have in common?', o: ['Both started as harvest festivals.', 'Both come from Ireland.', 'Both are religious.'] },
        { r: 'daring', q: 'Why does Emma mention a “day of mourning”?', o: ['to show that not everybody sees the story in the same way', 'to say Thanksgiving is sad for everyone', 'to explain the turkey'] },
        { r: 'daring', q: 'Complete from the podcast: “People ___ light bonfires and wear masks.”', o: ['used to', 'use to', 'are used to'] }
      ] },
    // LS criterion 2.2: a listening chart on two short videos of young people describing how they celebrate (what each speaker values, and the words, tone or images that show it).
    // Videos: illustrated, voices generated with ElevenLabs v3 (Roger chose this, 24 Oct 2026); normal + slow copy + WebVTT. The teacher sees the chart on the dashboard.
    { id: 'chart', type: 'step', tab: { ca: 'Graella d’escolta', en: 'Listening chart' }, title: { ca: 'Graella d’escolta: què és important per a ells?', en: 'Listening chart: what matters to them?' }, pill: { ca: 'Ho veu el professor', en: 'Your teacher sees it' },
      intro: { ca: 'Mira cada vídeo dues vegades. La primera, per saber quina festa és. La segona, per descobrir què és important per a cada persona i com ho notes.', en: 'Watch each video twice: first to find the celebration, then to find what matters to each speaker and how you can tell.' },
      html: { ca: '<div class="model"><strong>Valors per triar:</strong> la família · compartir menjar · la fe o les creences · recordar el passat · la comunitat · la llum i l’esperança · divertir-se · ajudar els altres</div><p class="tiny">Pista: fixa’t en les paraules que repeteixen, en el to de veu (content, emocionat, seriós) i en les imatges.</p>',
        en: '<p class="tiny">Listen for the words they repeat, their tone of voice (excited, proud, calm, serious) and what the images show.</p>' },
      media: { videos: [{ base: 'video/mei-lunar-new-year', title: 'Video 1 · Mei: Lunar New Year' }, { base: 'video/noah-hanukkah', title: 'Video 2 · Noah: Hanukkah' }], videoCredit: 'Illustrated videos made for English Lab. Voices generated with ElevenLabs.' },
      chunks: ['we light one more candle', 'It lasts eight nights', 'starting the year with good luck'],
      fields: [
        { id: 'v1', label: { ca: 'Vídeo 1 (Mei): què és important per a ella? (tria un valor de la llista)', en: 'Video 1 (Mei): what does she value? Say it in your own words.' }, rows: 2 },
        { id: 'e1', label: { ca: 'Vídeo 1: una paraula o frase del vídeo que ho mostra', en: 'Video 1: the evidence: a phrase from the video, and the tone or the images that show it' }, rows: 2 },
        { r: 'insecure', id: 'v2', label: { ca: 'Vídeo 2 (Noah): què és important per a ell? (tria un valor de la llista)', en: 'Video 2 (Noah): what does he value? Say it in your own words.' }, rows: 2 },
        { r: 'insecure', id: 'e2', label: { ca: 'Vídeo 2: una paraula o frase del vídeo que ho mostra', en: 'Video 2: the evidence: a phrase from the video, and the tone or the images that show it' }, rows: 2 },
        { r: 'daring', id: 'cmp', label: 'Compare Mei and Noah: what do they both value, and how are they different (words, tone, images)?', rows: 3 }
      ],
      rate: {
        beginners: ['He mirat el vídeo de la Mei dues vegades', 'He triat un valor de la llista', 'He copiat una paraula o frase que ho mostra'],
        insecure: ['He mirat cada vídeo dues vegades', 'He triat un valor per a cada persona', 'He copiat una paraula o frase que ho demostra'],
        safe: ['I watched each video twice', 'I explained what each speaker values', 'I backed it up with their words, tone or images'],
        daring: ['I watched each video twice', 'I explained what each speaker values with precise evidence', 'I compared the two speakers']
      } },
    { id: 'shadow', type: 'shadow', tab: { ca: 'Shadowing', en: 'Shadowing' }, title: { ca: 'Shadowing · Culture Bites: the story behind two autumn celebrations', en: 'Shadowing · Culture Bites: the story behind two autumn celebrations' }, pill: '3 ×',
      intro: { ca: 'Repeteix un tros de l’escolta just darrere de la veu, com una ombra.', en: 'Repeat part of the listening just behind the speaker, like a shadow.' },
      clip: { title: 'Culture Bites: the story behind two autumn celebrations', src: 'audio/culture-bites-origins.mp3', slow: 'audio/culture-bites-origins-slow.mp3', t: [53.08, 92.01], ts: [64.6, 111.38], lines: [
        ['Emma', 'Now, Thanksgiving. It takes place on the fourth Thursday of November, and this year that’s the twenty-sixth.'],
        ['Sam', 'The story usually starts in 1621. A group of English settlers, the Pilgrims, had a harvest feast with the Wampanoag people, who lived in the area. It lasted three days.'],
        ['Emma', 'But it didn’t become a national holiday until 1863, when President Abraham Lincoln made it official.'],
        ['Sam', 'Today families travel home, get together and share a big meal, usually with turkey. Many people say what they are grateful for.']], marks: [["**Now**, ↗ Thanks**giv**ing. ↘", "It **takes** **place**‿on the **fourth** **Thurs**day of No**vem**ber, ↗ and **this** **year** that’s the twenty-**sixth**. ↘"], ["The **sto**ry **us**ually **starts**‿in **1621**. ↘", "A **group**‿of **Eng**lish **set**tlers, ↗ the **Pil**grims, ↗ had‿a **har**vest **feast** with the Wampa**no**ag **peo**ple, ↗ who **lived**‿in the **ar**ea. ↘", "It **last**ed **three** **days**. ↘"], ["But it **did**n’t be**come**‿a **na**tional **hol**iday un**til** **1863**, ↗ when **Pres**ident **A**braham **Lin**coln **made**‿it of**fi**cial. ↘"], ["To**day** **fam**ilies **trav**el **home**, ↗ get to**geth**er‿and **share**‿a **big** **meal**, ↗ **us**ually with **tur**key. ↘", "**Man**y **peo**ple **say** what they‿are **grate**ful for. ↘"]], cues: [[53.2, 54.86, 64.73, 66.66], [55.03, 60.22, 66.87, 72.88], [60.51, 64.16, 73.68, 77.95], [64.35, 71.72, 78.2, 86.76], [72.26, 74.36, 87.5, 89.97], [74.5, 81.12, 90.48, 98.29], [81.25, 88.33, 98.8, 107.02], [88.86, 91.91, 107.71, 111.26]] } },
    /* Grammar in parts (Roger, 13 Nov 2026: "students don't have good activities to practise this theory"; "I also need to have examples to help me
       explain better and ask students to do examples"): one "How it works" box per point with the rule, several examples, the typical mistake
       and a ✏️ Your turn (the boxes are what 📘 Grammar together shows on the projector), then the practice in blocks, one per point, with
       different kinds of task (no listening: Roger, 13 Nov 2026 "no fem exercicis d'escoltar a gramàtica", LP3 only, the other LPs stay as they are): 👆 choose, 🔗 join, 🔄 change, 🔧 fix the mistake, ✏️ your own example (ls2-engine.js).
       Connectors are old (LS1, A2): only Starter and Base practise them (AGENTS.md › Grammar that comes back). */
    { id: 'grammar', redoBefore: '2026-11-09T21:00:00Z', req: 4, type: 'typed', tab: { ca: 'Gramàtica', en: 'Grammar' }, title: { ca: 'Connectors, orígens i comparacions', en: 'Origins, relatives and comparing' }, pill: { ca: 'Respon-ho tot', en: 'Answer all' },
      intro: { ca: 'Llegeix com funciona i mira els exemples. Cada bloc té fins a 7 preguntes obligatòries (el comptador te les va contant); quan les tinguis totes, prem Comprova i l’activitat queda feta. Després ve la ➕ pràctica extra, opcional. Si falles dues vegades, veuràs la resposta.', en: 'Read how it works and look at the examples. Each block has up to 7 compulsory questions (the counter keeps track); when you have them all, press Check and the activity is done. After them comes ➕ extra practice, optional. After two wrong tries you will see the answer.' },
      /* How it works, visual (Roger, 13 Nov 2026: "make the grammar explanation a bit more descriptive and with more examples so that students
         understand it better" → "make them more visual"): coloured cards, timelines, tables, ✗ → ✓ mistakes and a green ✏️ Your turn. Built with
         inline styles (the boxes are shown as they are on the LP, on the 📘 Grammar together projector and on every Chromebook); the helpers live
         inside this function, so nothing goes global. 📝 notes keep the text of the boxes (only b/strong/em/i/br/del/s/u tags). */
      explain: (function () {
        const C = { blue: ['#93c5fd', '#eff6ff', '#1d4ed8'], purple: ['#c4b5fd', '#f5f3ff', '#6d28d9'], green: ['#86efac', '#f0fdf4', '#15803d'], orange: ['#fdba74', '#fff7ed', '#c2410c'],
          teal: ['#5eead4', '#f0fdfa', '#0f766e'], amber: ['#fcd34d', '#fffbeb', '#b45309'], pink: ['#f9a8d4', '#fdf2f8', '#be185d'], slate: ['#cbd5e1', '#f8fafc', '#334155'] };
        const head = (icon, t, sub) => '<div style="font-size:1.18em;font-weight:800;margin-bottom:2px">' + icon + ' ' + t + '</div>' + (sub ? '<div style="color:#475569;margin:0 0 8px">' + sub + '</div>' : '');
        const card = (c, title, body, w) => '<div style="flex:1 1 ' + (w || 240) + 'px;min-width:0;border:2px solid ' + C[c][0] + ';background:' + C[c][1] + ';border-radius:14px;padding:10px 12px"><div style="font-weight:800;color:' + C[c][2] + ';margin-bottom:4px">' + title + '</div>' + body + '</div>';
        const row = (...cs) => '<div style="display:flex;flex-wrap:wrap;gap:10px;margin:10px 0">' + cs.join('') + '</div>';
        const ex = (s, note) => '<div style="margin:3px 0">▸ <em>' + s + '</em>' + (note ? ' <span style="color:#64748b;font-size:.9em">(' + note + ')</span>' : '') + '</div>';
        const bad = (w, r, note) => '<div style="margin:4px 0"><span style="color:#b91c1c;font-weight:700">✗ <del>' + w + '</del></span> → <span style="color:#15803d;font-weight:700">✓ ' + r + '</span>' + (note ? ' <span style="color:#64748b;font-size:.9em">' + note + '</span>' : '') + '</div>';
        const mistakes = (title, ...b) => '<div style="margin:10px 0;padding:8px 12px;border-radius:12px;background:#fef2f2;border:1px solid #fca5a5"><div style="font-weight:800;color:#b91c1c;margin-bottom:2px">⚠ ' + title + '</div>' + b.join('') + '</div>';
        const tip = (title, t) => '<div style="margin:10px 0;padding:8px 12px;border-radius:12px;background:#fffbeb;border:1px solid #fcd34d">💡 <b>' + title + '</b> ' + t + '</div>';
        const turn = (title, t) => '<div style="margin-top:10px;padding:8px 12px;border-radius:12px;background:#dcfce7;border:1px solid #86efac">✏️ <b>' + title + '</b> ' + t + '</div>';
        const table = rows => '<table style="border-collapse:collapse;width:100%;margin:6px 0;font-size:.95em">' + rows.map((r, i) => '<tr>' + r.map(c => '<td style="border:1px solid #cbd5e1;padding:5px 8px;vertical-align:top;' + (i === 0 ? 'background:#e2e8f0;font-weight:800' : 'background:#fff') + '">' + c + '</td>').join('') + '</tr>').join('') + '</table>';
        const pill = (c, t) => '<span style="display:inline-block;margin:2px 3px;padding:2px 10px;border-radius:999px;background:' + C[c][1] + ';border:1px solid ' + C[c][0] + ';color:' + C[c][2] + ';font-weight:800">' + t + '</span>';
        const PAIRS = ['bor', 'excit', 'tir', 'interest', 'amaz', 'surpris', 'disappoint', 'frighten'].map(w => [w + '<b style="color:#1d4ed8">ed</b>', w + '<b style="color:#c2410c">ing</b>']);
        // 🙌 a few questions the whole class does together after the explanation, answers hidden until the teacher opens them
        // (Roger, 13 Nov 2026: "some activities to do all together a few so that students understand better")
        const together = (ca, ...qs) => '<div style="margin:10px 0;padding:8px 12px;border-radius:12px;background:#eef2ff;border:1px solid #a5b4fc"><div style="font-weight:800;color:#4338ca;margin-bottom:2px">🙌 ' + (ca ? 'Tots junts' : 'All together') + '</div>' +
          qs.map(([q, a], i) => '<div style="margin:5px 0">' + (i + 1) + '. ' + q + ' <details style="display:inline-block;vertical-align:top;margin-left:4px"><summary style="cursor:pointer;color:#4338ca;font-weight:700">' + (ca ? 'Resposta' : 'Answer') + '</summary><b style="color:#15803d">' + a + '</b></details></div>').join('') + '</div>';
        // a timeline from the past to now, with dots where things happen (x in %) and an optional ✗ at "now"
        const timeline = (dots, notNow, label) => '<div style="display:flex;align-items:center;gap:8px;margin:8px 0 4px;font-size:.8em;font-weight:800;color:#475569">PAST<div style="flex:1;position:relative;height:26px"><div style="position:absolute;left:0;right:0;top:12px;height:4px;border-radius:2px;background:#94a3b8"></div>' +
          dots.map(([x, t]) => '<span style="position:absolute;left:' + x + '%;top:6px;width:16px;height:16px;border-radius:50%;background:#1d4ed8;border:2px solid #fff"></span>' + (t ? '<span style="position:absolute;left:' + x + '%;top:-10px;transform:translateX(-25%);font-size:.95em;color:#1d4ed8">' + t + '</span>' : '')).join('') +
          (notNow ? '<span style="position:absolute;right:-4px;top:0;font-size:1.3em;color:#b91c1c">✗</span>' : '') + '</div>NOW</div>' + (label ? '<div style="font-size:.85em;color:#475569;text-align:center;margin-bottom:4px">' + label + '</div>' : '');
        return [
          { p: 'conn', only: ['beginners', 'insecure'],
            ca: head('🔗', 'Connectors: paraules que uneixen les idees', 'Sense connectors, un text són frases soltes. Amb connectors, el lector entén l’ordre, què afegeixes, què és diferent i per què.') +
              row(card('blue', '1️⃣ Ordre · primer, després, al final', pill('blue', 'First,') + pill('blue', 'Then,') + pill('blue', 'Next,') + pill('blue', 'Finally,') + ex('<b>First</b>, we clean the house.') + ex('<b>Then</b>, we decorate it.') + ex('<b>Finally</b>, we eat together.') + '<div style="font-size:.9em;color:#475569">A l’inici de la frase, amb coma.</div>'),
                card('green', '➕ Afegir · i, també', pill('green', 'and') + pill('green', 'also') + ex('We eat chestnuts <b>and</b> panellets.') + ex('We <b>also</b> eat sweet potatoes.') + '<div style="font-size:.9em;color:#475569"><b>also</b> va davant del verb.</div>')) +
              row(card('orange', '↔️ Contrast · però', pill('orange', 'but') + ex('I like costumes, <b>but</b> I don’t like scary films.') + ex('It’s cold outside, <b>but</b> the house is cosy.')),
                card('purple', '❓ Raó · perquè', pill('purple', 'because') + ex('I love Halloween <b>because</b> I can dress up.') + ex('We stay at home <b>because</b> it’s a family day.'))) +
              mistakes('Compte!', bad('We eat also panellets.', 'We <b>also</b> eat panellets.'), bad('Because I like it.', 'I go <b>because</b> I like it.', '(sola no és una frase)')) +
              together(true, ['We eat chestnuts ___ we drink hot chocolate.', 'and'], ['I stay at home ___ it’s a family day.', 'because']) +
              turn('Ara tu:', 'explica tres passos de la teva festa preferida amb <em>First, Then, Finally</em>, i per què t’agrada amb <em>because</em>.'),
            en: head('🔗', 'Connectors: words that join your ideas', 'They tell the reader the order, what you add, what is different and why.') +
              row(card('blue', '1️⃣ Order', pill('blue', 'First,') + pill('blue', 'Then,') + pill('blue', 'Finally,') + ex('<b>First</b>, we clean the house.') + ex('<b>Then</b>, we decorate it.')),
                card('green', '➕ Add', pill('green', 'and') + pill('green', 'also') + ex('We <b>also</b> eat sweet potatoes.')),
                card('orange', '↔️ Contrast', pill('orange', 'but') + ex('I like costumes, <b>but</b> I don’t like scary films.')),
                card('purple', '❓ Reason', pill('purple', 'because') + ex('I love Halloween <b>because</b> I can dress up.'))) +
              mistakes('Watch out', bad('We eat also panellets.', 'We <b>also</b> eat panellets.')) + together(false, ['We eat chestnuts ___ we drink hot chocolate.', 'and'], ['I stay at home ___ it’s a family day.', 'because']) +
              turn('Your turn:', 'three steps of your favourite celebration with <em>First, Then, Finally</em>.') },
          { p: 'custom', r: 'insecure', only: ['insecure'],
            ca: head('📅', 'Costums: què fem cada any', 'Per a coses que passen <b>sempre</b> o <b>cada any</b>: <b>Present Simple</b>.') +
              row(card('teal', '🗓 Quan és la festa', ex('It <b>takes place</b> in November.', 'té lloc') + ex('It <b>is held</b> on 31 October.', 'es fa') + ex('It <b>is celebrated</b> in spring.', 'se celebra') + '<div style="margin-top:4px">' + pill('teal', 'in + mes / estació') + pill('teal', 'on + dia / data') + '</div>'),
                card('blue', '✅ Què fem', ex('We <b>eat</b> panellets.') + ex('My grandma <b>makes</b> a special cake.', 'he / she → -s')),
                card('orange', '🚫 Què no fem', ex('We <b>don’t work</b> on 25 December.') + ex('My cousins <b>don’t celebrate</b> Halloween.') + ex('My dad <b>doesn’t eat</b> chestnuts.', 'he / she → doesn’t'))) +
              mistakes('Compte!', bad('We don’t works.', 'We don’t <b>work</b>.', '(després de don’t / doesn’t, verb sense -s)'), bad('It takes place on November.', 'It takes place <b>in</b> November.')) +
              together(true, ['The Castanyada ___ ___ on 31 October. (es fa)', 'is held']) +
              turn('Ara tu:', 'digues quan és la teva festa preferida i una cosa que <b>no</b> fas aquell dia.'),
            en: head('📅', 'Customs: what we do every year') + ex('It <b>takes place</b> in November. It <b>is held</b> on 31 October.') + ex('We <b>don’t work</b> on 25 December.') + together(false, ['The Castanyada ___ ___ on 31 October. (es fa)', 'is held']) +
              turn('Your turn:', 'when is your favourite celebration, and one thing you don’t do that day?') },
          { p: 'past', r: 'safe', en: head('⏳', 'Past Simple or <em>used to</em>?', 'Both talk about the past, but they tell a different story. Look at the timelines.') +
              row(card('blue', '🅰 Past Simple = ONE finished event', timeline([[30, '1621']], false, 'It happened once, often with a date or <em>yesterday, last year, in 1621</em>.') +
                  ex('The Pilgrims <b>sailed</b> to America in 1620.', 'regular: + -ed') + ex('The first Thanksgiving <b>took</b> place in 1621.', 'irregular') + ex('The Wampanoag <b>taught</b> them to grow corn.', 'irregular') + ex('Lincoln <b>made</b> it official in 1863.', 'irregular'), 300),
                card('purple', '🅱 used to + verb = a HABIT that stopped', timeline([[8], [18], [28], [38], [48]], true, 'It happened again and again… and it is <b>not true now</b>.') +
                  ex('People <b>used to carve</b> turnips.', 'now: pumpkins') + ex('My grandparents <b>used to roast</b> chestnuts in the street.', 'now they buy them') + ex('I <b>used to write</b> to the Three Kings.', 'not any more!') + ex('My dad <b>used to go</b> trick or treating.'), 300)) +
              table([['', '🅰 Past Simple', '🅱 used to'], ['➕', 'They <b>had</b> a feast.', 'They <b>used to have</b> a feast every year.'], ['➖', 'They <b>didn’t have</b> enough food.', 'Children <b>didn’t use to</b> go trick or treating.'], ['❓', '<b>Did</b> they <b>arrive</b> in winter?', '<b>Did</b> people <b>use to</b> wear masks?']]) +
              card('amber', '📚 Irregular verbs: learn them by heart!', '<div style="display:flex;flex-wrap:wrap;gap:4px">' + [['take', 'took'], ['make', 'made'], ['go', 'went'], ['eat', 'ate'], ['bring', 'brought'], ['teach', 'taught'], ['give', 'gave'], ['sing', 'sang'], ['become', 'became'], ['begin', 'began'], ['have', 'had'], ['come', 'came']].map(([a, b]) => '<span style="padding:2px 8px;border-radius:8px;background:#fff;border:1px solid #fcd34d">' + a + ' → <b>' + b + '</b></span>').join('') + '</div><div style="margin-top:4px;font-size:.9em">Regular: <em>sail → sailed · celebrate → celebrated · carve → carved</em></div>', 600) +
              tip('🅰 or 🅱?', '<u>One time</u>, maybe with a date → Past Simple: <em>In 1621 they <b>had</b> a feast.</em> · <u>Many times</u>, and not true now → used to: <em>Every year they <b>used to have</b> a feast.</em>') +
              mistakes('Watch out', bad('We used to went.', 'We used to <b>go</b>.', '(base form after used to)'), bad('They didn’t had food.', 'They didn’t <b>have</b> food.'), bad('Did you used to…?', 'Did you <b>use to</b>…?', '(no -d after did)'), bad('I use to go every Sunday.', 'I <b>usually</b> go every Sunday.', '(used to = only past)')) +
              together(false, ['In 1621 they ___ (have) a feast.', 'had'], ['My grandparents ___ ___ ___ (roast) chestnuts in the street. Now they buy them.', 'used to roast']) +
              turn('Your turn:', 'one thing you <em>used to</em> do at Halloween or Christmas when you were 7, one thing you <em>didn’t use to</em> do, and one thing that happened <u>last</u> Christmas.') },
          { p: 'rel', r: 'safe', en: head('🎯', 'Relatives: who, which, that, where, when', 'They come <u>right after a noun</u> and tell us <b>exactly which</b> person, thing, place or time we mean. “That’s the woman.” Which woman? → “That’s the woman <b>who makes the best panellets</b>.”') +
              row(card('blue', '👤 who / that → people', ex('The Wampanoag were the people <b>who</b> lived in the area.') + ex('Squanto was the man <b>who</b> helped the Pilgrims.'), 200),
                card('green', '📦 which / that → things', ex('Diwali is a festival <b>which</b> celebrates light.') + ex('A diya is a lamp <b>that</b> people light.'), 200),
                card('orange', '📍 where → places', ex('Plymouth is the town <b>where</b> the Pilgrims arrived.') + ex('The square is the place <b>where</b> the parade ends.'), 200),
                card('purple', '🕐 when → times', ex('31 October is the night <b>when</b> we eat panellets.') + ex('December is the month <b>when</b> Hanukkah takes place.'), 200)) +
              card('slate', '🔗 How to join two sentences', table([['1. Two sentences', '2. Find the repeated word', '3. Change it for the relative'],
                ['Samhain was a festival. It marked the end of summer.', '<span style="background:#fde68a;padding:0 4px;border-radius:4px">It</span> = the festival', 'Samhain was a festival <b>which</b> marked the end of summer.'],
                ['Mei is a girl. She celebrates Lunar New Year.', '<span style="background:#fde68a;padding:0 4px;border-radius:4px">She</span> = the girl', 'Mei is a girl <b>who</b> celebrates Lunar New Year.'],
                ['Panellets are cakes. We eat them at the Castanyada.', '<span style="background:#fde68a;padding:0 4px;border-radius:4px">them</span> = the cakes', 'Panellets are cakes <b>which</b> we eat at the Castanyada.'],
                ['Plymouth is a town. The Pilgrims arrived there.', '<span style="background:#fde68a;padding:0 4px;border-radius:4px">there</span> = the town', 'Plymouth is the town <b>where</b> the Pilgrims arrived.']]), 600) +
              card('slate', '🎯 Defining or 💬 non-defining?', row(
                  card('blue', '🎯 Defining: NO commas', ex('The festival <b>which</b> I like most is Diwali.') + ex('The man <b>who</b> helped the Pilgrims was Squanto.') + '<div style="font-size:.9em;color:#475569;margin-top:4px">It tells us <b>WHICH one</b>. Take it away and we don’t know which festival or which man.</div>', 230),
                  card('purple', '💬 Non-defining: <b>, which … ,</b>', ex('Diwali<b>, which</b> is celebrated in autumn<b>,</b> is the festival of lights.') + ex('Squanto<b>, who</b> spoke English<b>,</b> helped the Pilgrims.') + '<div style="font-size:.9em;color:#475569;margin-top:4px"><b>EXTRA</b> information about a name we already know. Take it away and the sentence still works. Only <b>who / which</b>, never <em>that</em>.</div>', 230)) +
                '<div style="font-size:.95em">🧪 <b>Test:</b> cover the relative part with your finger. Do you still know <u>which one</u>? Yes → non-defining, add commas. No → defining, no commas.</div>', 600) +
              mistakes('Watch out', bad('a festival which it started in Ireland', 'a festival <b>which</b> started in Ireland', '(don’t say it twice)'), bad('cakes which we eat them', 'cakes <b>which</b> we eat'), bad('the people which', 'the people <b>who</b>'), bad('the place which the parade ends', 'the place <b>where</b> the parade ends'), bad('Diwali, that is celebrated in autumn, …', 'Diwali<b>, which</b> is celebrated in autumn, …', '(never that between commas)')) +
              together(false, ['Squanto was the man ___ helped the Pilgrims.', 'who'], ['Diwali, ___ is in autumn, is the festival of lights.', 'which (never that)']) +
              turn('Your turn:', 'describe your town’s festa: a person (<em>who</em>), a thing you eat (<em>which</em>), a place (<em>where</em>) and a day (<em>when</em>).') },
          { p: 'comp', r: 'safe', en: head('⚖️', 'Comparing two celebrations', 'Say what is <b>the same</b> and what is <b>different</b>, in one sentence.') +
              row(card('green', '🟰 The same', pill('green', 'Both … and …') + pill('green', 'similar to') + pill('green', 'like') +
                  ex('<b>Both</b> Halloween <b>and</b> the Castanyada <b>take</b> place on 31 October.', 'plural verb') + ex('The Castanyada is <b>similar to</b> Thanksgiving: both are about family and food.') + ex('<b>Like</b> Christmas, Hanukkah is in December.'), 300),
                card('orange', '≠ Different', pill('orange', 'whereas / while') + pill('orange', 'unlike') + pill('orange', 'different from') +
                  ex('Halloween is about costumes, <b>whereas</b> the Castanyada is about food and family.') + ex('<b>Unlike</b> Halloween, the Castanyada is celebrated at home.') + ex('Thanksgiving is <b>different from</b> Halloween.'), 300)) +
              table([['Word', 'What comes after it', 'Example'], ['<b>whereas / while</b>', 'a full sentence (comma before)', '… costumes<b>, whereas</b> the Castanyada is about food.'], ['<b>unlike / like</b>', 'a noun, then a comma', '<b>Unlike</b> Halloween<b>,</b> the Castanyada…'], ['<b>similar to / different from</b>', 'a noun', 'similar <b>to</b> Thanksgiving · different <b>from</b> Halloween'], ['<b>both … and</b>', 'two nouns + plural verb', '<b>Both</b> Diwali <b>and</b> Hanukkah <b>are</b>…']]) +
              tip('How to build it:', 'take one fact from each celebration and choose the word. <em>Halloween: costumes · Castanyada: chestnuts</em> → <em>At Halloween people wear costumes, <b>whereas</b> at the Castanyada they eat chestnuts.</em>') +
              mistakes('Watch out', bad('Both Diwali and Hanukkah is…', 'Both Diwali and Hanukkah <b>are</b>…'), bad('similar than', 'similar <b>to</b>'), bad('different of', 'different <b>from</b>'), bad('Unlike Halloween is…', 'Unlike Halloween, the Castanyada is…')) +
              together(false, ['___ Halloween ___ the Castanyada are on 31 October.', 'Both … and'], ['Halloween is about costumes, ___ the Castanyada is about food.', 'whereas']) +
              turn('Your turn:', 'compare your favourite celebration with one from another country: one thing that is the same (<em>both… and</em>) and one that is different (<em>whereas</em> or <em>unlike</em>).') },
          { p: 'plus', r: 'daring', en: head('➕', 'Extra information and concession', 'Non-defining relatives are in the relatives box: here you use them in longer sentences, with <em>although</em>.') +
              card('purple', '💬 Extra information, between commas', ex('Lincoln<b>, who</b> was president in 1863<b>,</b> made it official.') + ex('Thanksgiving<b>, which</b> takes place in November<b>,</b> became official in 1863.'), 600) +
              card('orange', '🤔 Concession: two ideas that seem to clash', ex('<b>Although</b> Halloween started in Europe, it is now very popular in the USA.') + ex('We had fun <b>even though</b> it rained.') + ex('Many families love the feast. <b>On the other hand</b>, some Native Americans see it as a day of mourning.'), 600) +
              mistakes('Watch out', bad('Diwali, that is celebrated…', 'Diwali, <b>which</b> is celebrated…'), bad('Although it rained, but we had fun.', 'Although it rained, we had fun.', '(no but)')) +
              together(false, ['___ it rained, we had fun.', 'Although (Even though)']) +
              turn('Your turn:', 'add extra information about a celebration with <em>, which … ,</em> and make one sentence with <em>although</em>.') },
          { p: 'feel',
            ca: head('😊', 'Sentiments: -ed o -ing?', 'Molts adjectius tenen dues formes, i no volen dir el mateix!') +
              row(card('blue', '🙋 -ed = com et sents TU', ex('I’m <b>bored</b>.', 'm’avorreixo') + ex('We were <b>excited</b> about the party.', 'il·lusionats') + ex('She was <b>tired</b> after the parade.', 'cansada') + ex('My brother was <b>frightened</b> of the masks.', 'tenia por') + ex('I’m <b>interested in</b> Diwali.', 'm’interessa')),
                card('orange', '🎆 -ing = com és LA COSA', ex('The speech is <b>boring</b>.', 'és avorrit') + ex('The fireworks were <b>amazing</b>.', 'increïbles') + ex('Dancing all night is <b>tiring</b>.', 'cansa') + ex('The film was <b>frightening</b>.', 'feia por'))) +
              tip('Truc:', 'pregunta’t <u>qui</u> sent què. 🎬 <em>The film was <b>frightening</b></em> → 😱 <em>so I was <b>frightened</b>.</em>') +
              table([['🙋 -ed (persona)', '🎆 -ing (cosa)']].concat(PAIRS)) +
              mistakes('Compte!', bad('I’m boring.', 'I’m <b>bored</b>.', '(“I’m boring” = sóc una persona avorrida!)'), bad('interested on', 'interested <b>in</b>')) +
              together(true, ['The film was ___ (frighten).', 'frightening'], ['I was ___ (bore) at the parade.', 'bored']) +
              turn('Ara tu:', 'digues com et sents en una festa (-ed) i com és alguna cosa d’aquella festa (-ing).'),
            en: head('😊', 'Feelings: -ed or -ing?', 'Many feeling adjectives have two forms, and they don’t mean the same thing!') +
              row(card('blue', '🙋 -ed = how YOU feel', ex('I’m <b>bored</b>.') + ex('We were <b>excited</b> about the party.') + ex('She was <b>tired</b> after the parade.') + ex('My brother was <b>frightened</b> of the masks.') + ex('I’m <b>interested in</b> Diwali.')),
                card('orange', '🎆 -ing = what THE THING is like', ex('The speech is <b>boring</b>.') + ex('The fireworks were <b>amazing</b>.') + ex('Dancing all night is <b>tiring</b>.') + ex('The film was <b>frightening</b>.'))) +
              tip('Trick:', 'ask <u>who</u> feels what. 🎬 <em>The film was <b>frightening</b></em> → 😱 <em>so I was <b>frightened</b>.</em>') +
              table([['🙋 -ed (person)', '🎆 -ing (thing)']].concat(PAIRS)) +
              mistakes('Watch out', bad('I’m boring.', 'I’m <b>bored</b>.', '(“I’m boring” = you are a boring person!)'), bad('interested on', 'interested <b>in</b>')) +
              together(false, ['The film was ___ (frighten).', 'frightening'], ['I was ___ (bore) at the parade.', 'bored']) +
              turn('Your turn:', 'say how you feel at a celebration (-ed) and what something there is like (-ing).') }
        ];
      })(),
      parts: [
        { id: 'conn', title: { ca: 'Connectors', en: 'Connectors' }, note: { ca: 'Ordre: <em>First, Then, Finally</em> · afegir: <em>and, also</em> · contrast: <em>but</em> · raó: <em>because</em>.', en: 'Order: <em>First, Then, Finally</em> · add: <em>and, also</em> · contrast: <em>but</em> · reason: <em>because</em>.' } },
        { id: 'custom', title: { ca: 'Costums', en: 'Customs' }, note: { ca: '<em>It takes place in…</em> · <em>It is held on…</em> · <em>We don’t + verb</em>.', en: '<em>It takes place in…</em> · <em>It is held on…</em> · <em>We don’t + verb</em>.' } },
        { id: 'past', title: { en: 'Past Simple or used to?' }, note: { en: 'One event, often with a date → <b>Past Simple</b>: regular <em>-ed</em> (<em>sailed</em>) or irregular (<em>took, made, went, ate, brought, taught</em>). A past habit that is not true now → <b>used to + base form</b> (<em>used to go</em>, not <del>used to went</del>). After <em>did / didn’t</em> → <b>use to</b>.' } },
        { id: 'rel', title: { en: 'Who, which, where, when' }, note: { en: 'People → <b>who</b> · things → <b>which / that</b> · places → <b>where</b> · times → <b>when</b>. When you join two sentences, the relative replaces <em>he, she, it, them, there, then</em>: don’t say both. Extra information about a name between commas → <b>, which … ,</b> / <b>, who … ,</b> (never <em>that</em>).' } },
        { id: 'comp', title: { en: 'Comparing two celebrations' }, note: { en: 'Use these facts:<br>🎃 <b>Halloween</b>: 31 October · costumes, trick or treating · it comes from Samhain, a Celtic festival.<br>🌰 <b>Castanyada</b>: 31 October · chestnuts, panellets, sweet potatoes · at home, with family.<br>🦃 <b>Thanksgiving</b>: fourth Thursday of November · turkey, a big family meal · it comes from a harvest feast in 1621.' } },
        { id: 'plus', title: { en: 'Extra information and although' }, note: { en: 'Extra information between commas: <b>, which … ,</b> / <b>, who … ,</b> (never <em>that</em>) · <b>Although / Even though</b> + a sentence · <b>On the other hand,</b> at the start of a new sentence.' } },
        { id: 'feel', title: { ca: '-ed o -ing?', en: '-ed or -ing?' }, note: { ca: '<b>-ed</b> = com et sents · <b>-ing</b> = com és la cosa.', en: '<b>-ed</b> = how you feel · <b>-ing</b> = what the thing is like.' } }
      ],
      items: [
        /* Each block: the first 6 questions this route sees + the ✏️ own example are compulsory (ls2-engine.js arrange); the rest is ➕ extra practice. Keep the 6 first ones a mix of kinds. */
        /* Connectors (Starter and Base) */
        { p: 'conn', only: ['beginners', 'insecure'], opts: ['because', 'but', 'also'], q: 'I love Halloween ___ I can dress up.', a: ['because'], ca: 'Dona una raó.', en: 'It gives a reason.' },
        { p: 'conn', only: ['beginners', 'insecure'], q: 'My brother likes costumes, ___ he doesn’t like scary films.', a: ['but'], ca: 'Contrast.', en: 'Contrast.' },
        { p: 'conn', only: ['beginners', 'insecure'], opts: ['First', 'Finally', 'Because'], q: '___, we clean the house. Then we decorate it.', a: ['first'], ca: 'Primer pas.', en: 'First step.' },
        { p: 'conn', only: ['beginners', 'insecure'], q: 'We eat chestnuts. We ___ eat panellets.', a: ['also'], ca: 'Afegeix informació.', en: 'Adds information.' },
        { p: 'conn', only: ['beginners', 'insecure'], q: '___, we all eat together.', a: ['finally'], ca: 'Últim pas.', en: 'Last step.' },
        { p: 'conn', only: ['beginners', 'insecure'], opts: ['but', 'because', 'also'], q: 'It’s cold outside, ___ the house is cosy.', a: ['but'], ca: 'Contrast.', en: 'Contrast.' },
        { p: 'conn', r: 'insecure', only: ['insecure'], k: 'fix', q: '“We eat also panellets.” → We ___ ___ panellets.', a: ['also eat'], ca: '<em>also</em> va davant del verb.', en: '<em>also</em> goes before the verb.' },
        { p: 'conn', only: ['beginners', 'insecure'], a: [], own: { must: ['\\bfirst\\b', '\\bthen\\b'], min: 6 }, q: 'Escriu dos passos de la teva festa preferida amb <b>First</b> i <b>Then</b>. <span class="tiny">(Write two steps of your favourite celebration.)</span>', show: 'First, we decorate the house. Then, we eat a special meal.', ca: 'Fes servir First i Then.', en: 'Use First and Then.' },
        /* Customs (Base) */
        { p: 'custom', r: 'insecure', only: ['insecure'], q: 'Thanksgiving ___ ___ in November. (té lloc)', a: ['takes place'], ca: 'Costum: It takes place in + mes.', en: 'Custom: It takes place in + month.' },
        { p: 'custom', r: 'insecure', only: ['insecure'], opts: ["don't work", "doesn't work", 'not work'], q: 'In Catalonia, we ___ (not / work) on 25 December.', a: ["don't work", 'do not work'], ca: 'Costum en negatiu: don’t + verb.', en: 'Negative custom: don’t + verb.' },
        { p: 'custom', r: 'insecure', only: ['insecure'], q: 'At Diwali, people light lamps, ___ they also eat sweets. (afegeix)', a: ['and'], ca: 'Afegeix informació: and.', en: 'Adds information: and.' },
        { p: 'custom', r: 'insecure', a: [], own: { must: ["\\b(in|on|at)\\b", "\\b(don['’]t|do not)\\b"], min: 8 }, q: "Your turn: when is your favourite celebration, and one thing you <b>don’t</b> do that day? <span class=\"tiny\">(Quan és la teva festa preferida i una cosa que no fas aquell dia.)</span>", show: "My favourite celebration is Christmas, on 25 December. We don’t go to school.", ca: "Fes servir in / on / at i don’t.", en: "Use in / on / at and don’t." },
        /* Past Simple (regular and irregular) or used to (Core, Plus). Roger, 13 Nov 2026: "more verbs to transform … irregular verbs" */
        { p: 'past', r: 'safe', only: ['safe'], opts: ['had', 'used to have', 'use to have'], q: 'In 1621, the Pilgrims ___ a harvest feast with the Wampanoag.', a: ['had'], en: 'One finished event with a date → Past Simple.' },
        { p: 'past', r: 'safe', q: 'The Wampanoag ___ (teach) the Pilgrims how to grow corn.', a: ['taught'], en: 'Irregular verb: teach → taught.' },
        { p: 'past', r: 'safe', k: 'change', q: 'Use <em>used to</em>: “When I was little, I ate panellets every 31 October.” → I ___ ___ ___ panellets every 31 October.', a: ['used to eat'], en: 'Irregular: ate → used to + base form (eat).' },
        { p: 'past', r: 'safe', k: 'change', q: 'Make it negative: “40 years ago, people in Spain used to celebrate Halloween.” (It isn’t true!) → 40 years ago, people in Spain ___ ___ ___ celebrate Halloween.', a: ["didn't use to", 'did not use to'], show: "didn't use to", en: 'Negative: didn’t use to (no -d).' },
        { p: 'past', r: 'safe', k: 'change', q: 'Make the question for this answer: “Yes, they did. People used to wear masks at Samhain.” → ___ people ___ ___ wear masks at Samhain?', a: ['did use to'], show: 'Did … use to', en: 'Question: Did + subject + use to + verb?' },
        { p: 'past', r: 'safe', k: 'fix', q: '“When I was young, we used to went to the Castanyada party at school.” → we used to ___ to the Castanyada party.', a: ['go'], en: 'After used to: the base form (go), never the past (went).' },
        { p: 'past', r: 'safe', opts: ['used to roast', 'use to roast', 'usually roast'], q: 'My grandparents ___ chestnuts in the street, but now they buy them in a shop.', a: ['used to roast'], en: 'A past habit that is not true now → used to + verb.' },
        { p: 'past', r: 'safe', q: 'The first Thanksgiving ___ (take) place in 1621.', a: ['took'], en: 'One finished event: Past Simple.' },
        { p: 'past', r: 'safe', q: 'In 1620, the Pilgrims ___ (sail) to America on the Mayflower.', a: ['sailed'], en: 'Regular verb: + -ed.' },
        { p: 'past', r: 'safe', q: 'In 1863, Lincoln ___ (make) Thanksgiving a national holiday.', a: ['made'], en: 'Irregular verb: make → made.' },
        { p: 'past', r: 'safe', q: 'Irish families ___ (bring) Halloween to the USA in the 1800s.', a: ['brought'], en: 'Irregular verb: bring → brought.' },
        { p: 'past', r: 'safe', q: 'In their first winter, the Pilgrims ___ (not / have) enough food.', a: ["didn't have", 'did not have'], show: "didn't have", en: 'Negative: didn’t + base form (not didn’t had).' },
        { p: 'past', r: 'safe', k: 'change', q: 'Use <em>used to</em>: “When she was little, my mum dressed up as a witch every Halloween.” → My mum ___ ___ ___ up as a witch every Halloween.', a: ['used to dress'], en: 'used to + the verb without -ed.' },
        { p: 'past', r: 'safe', k: 'change', q: 'Use <em>used to</em>: “As a child, my dad went trick or treating every year.” → My dad ___ ___ ___ trick or treating every year.', a: ['used to go'], en: 'Irregular: went → used to + base form (go).' },
        { p: 'past', r: 'safe', k: 'change', q: 'Use <em>used to</em>: “In Ireland, people made lanterns from turnips.” → In Ireland, people ___ ___ ___ lanterns from turnips.', a: ['used to make'], en: 'Irregular: made → used to make.' },
        { p: 'past', r: 'safe', k: 'change', q: 'Use <em>used to</em>: “My grandmother sang Christmas carols with the whole family.” → My grandmother ___ ___ ___ Christmas carols with the whole family.', a: ['used to sing'], en: 'Irregular: sang → used to sing.' },
        { p: 'past', r: 'safe', a: [], own: { must: ['\\bused to \\w+'], min: 6 }, q: 'Write one thing you <b>used to</b> do at a celebration when you were little, and that you don’t do now.', show: 'I used to write a letter to the Three Kings, but now I don’t.', en: 'Use used to + verb.' },
        /* Relatives (Core, Plus) */
        { p: 'rel', r: 'safe', opts: ['who', 'which', 'where', 'when'], q: 'The Wampanoag were the people ___ lived in the area.', a: ['who', 'that'], en: 'People: who.' },
        { p: 'rel', r: 'safe', opts: ['which', 'who', 'where', 'when'], q: 'A diya is a small oil lamp ___ people light at Diwali.', a: ['which', 'that'], en: 'Things: which / that.' },
        { p: 'rel', r: 'safe', k: 'join', q: '“Samhain was a Celtic festival. It marked the end of summer.” → Samhain was a Celtic festival ___ ___ the end of summer.', a: ['which marked', 'that marked'], en: 'which replaces it: don’t say both.' },
        { p: 'rel', r: 'safe', k: 'join', q: '“Panellets are small cakes. We eat them at the Castanyada.” → Panellets are small cakes ___ we eat at the Castanyada.', a: ['which', 'that'], en: 'which replaces them: don’t say “which we eat them”.' },
        { p: 'rel', r: 'safe', k: 'join', q: '“Plymouth is the town. The Pilgrims arrived there in 1620.” → Plymouth is the town ___ the Pilgrims ___ in 1620.', a: ['where arrived'], show: 'where … arrived', en: 'where replaces there.' },
        { p: 'rel', r: 'safe', k: 'fix', q: '“Halloween is a festival which it started in Ireland.” → Halloween is a festival ___ started in Ireland.', a: ['which', 'that'], en: 'which replaces it: don’t say both.' },
        { p: 'rel', r: 'safe', opts: ['when', 'where', 'which', 'who'], q: 'December is the month ___ Hanukkah usually takes place.', a: ['when'], en: 'Time: when.' },
        { p: 'rel', r: 'safe', q: 'Diwali is a festival ___ celebrates light.', a: ['which', 'that'], en: 'Things: which / that.' },
        { p: 'rel', r: 'safe', q: 'Mexico is the country ___ people celebrate the Day of the Dead.', a: ['where'], en: 'Places: where.' },
        { p: 'rel', r: 'safe', q: 'Jack-o’-lanterns are pumpkins ___ have faces carved in them.', a: ['which', 'that'], en: 'Things: which / that.' },
        { p: 'rel', r: 'safe', k: 'join', q: '“Squanto was a Wampanoag man. He helped the Pilgrims.” → Squanto was the Wampanoag man ___ ___ the Pilgrims.', a: ['who helped', 'that helped'], en: 'who replaces he.' },
        { p: 'rel', r: 'safe', k: 'join', q: '“Mei is a girl from Manchester. She celebrates Lunar New Year.” → Mei is a girl from Manchester ___ ___ Lunar New Year.', a: ['who celebrates', 'that celebrates'], en: 'who replaces she.' },
        { p: 'rel', r: 'safe', k: 'join', q: '“1 November is the day. Many families visit the cemetery then.” → 1 November is the day ___ many families visit the cemetery.', a: ['when'], en: 'when replaces then.' },
        { p: 'rel', r: 'safe', k: 'fix', q: '“The Pilgrims were the people which sailed on the Mayflower.” → The Pilgrims were the people ___ sailed on the Mayflower.', a: ['who', 'that'], en: 'People: who, not which.' },
        { p: 'rel', r: 'safe', a: [], own: { must: ['\\b(who|which|where|when)\\b'], min: 7 }, q: 'Describe a place, a person or a day of your town’s festa with <b>who, which, where</b> or <b>when</b>.', show: 'The square is the place where the correfoc starts.', en: 'Use who, which, where or when.' },
        // defining or non-defining (Roger, 13 Nov 2026: "defining and non defining distinction should be added to core level too"): after the
        // own example, so they are extra practice and students who already handed the step in keep it done
        { p: 'rel', r: 'safe', opts: ['defining', 'non-defining'], q: '“The man who helped the Pilgrims was Squanto.” Is the relative part defining or non-defining?', a: ['defining'], en: 'It tells us which man: defining, no commas.' },
        { p: 'rel', r: 'safe', opts: ['defining', 'non-defining'], q: '“Squanto, who spoke English, helped the Pilgrims.” Is the relative part defining or non-defining?', a: ['non-defining'], en: 'We already know who Squanto is: extra information between commas.' },
        { p: 'rel', r: 'safe', opts: ['which', 'that', 'who'], q: 'Diwali, ___ is celebrated in autumn, is the festival of lights.', a: ['which'], en: 'Between commas: which, never that.' },
        { p: 'rel', r: 'safe', opts: ['who', 'that', 'which'], q: 'My grandmother, ___ makes the best panellets, lives in Reus.', a: ['who'], en: 'A person, extra information between commas: who, never that.' },
        { p: 'rel', r: 'safe', k: 'fix', q: '“The Castanyada, that takes place on 31 October, is a Catalan tradition.” → The Castanyada, ___ takes place on 31 October, is a Catalan tradition.', a: ['which'], en: 'Non-defining relatives never use that.' },
        /* Comparing (Core, Plus) */
        { p: 'comp', r: 'safe', q: '___ Halloween ___ the Castanyada take place on 31 October.', a: ['both and'], show: 'Both … and', en: 'The same: Both… and…' },
        { p: 'comp', r: 'safe', q: 'Halloween is about costumes, ___ the Castanyada is about food and family.', a: ['whereas', 'while'], en: 'Contrast between two things.' },
        { p: 'comp', r: 'safe', only: ['safe'], opts: ['Unlike', 'Whereas', 'Both'], q: '___ Halloween, the Castanyada is a family celebration at home.', a: ['unlike'], en: 'Unlike + noun.' },
        { p: 'comp', r: 'safe', opts: ['different from', 'similar to', 'different of'], q: 'Thanksgiving is ___ Halloween: it’s a family meal, not a costume party.', a: ['different from'], en: 'Different: different from (not of).' },
        { p: 'comp', r: 'safe', opts: ['similar to', 'similar than', 'different from'], q: 'The Castanyada is ___ Thanksgiving: both are about family and food.', a: ['similar to'], en: 'The same: similar to (not than).' },
        { p: 'comp', r: 'safe', k: 'fix', q: '“Both Diwali and Hanukkah is festivals of light.” → Both Diwali and Hanukkah ___ festivals of light.', a: ['are'], en: 'Both… and → plural verb.' },
        { p: 'comp', r: 'safe', a: [], own: { must: ['\\b(whereas|while)\\b'], min: 8 }, q: 'Compare two celebrations (from the box above or your own) with <b>whereas</b> or <b>while</b>.', show: 'At Christmas we eat at home, whereas at Halloween we go out in costumes.', en: 'Use whereas or while between two sentences.' },
        /* Plus */
        { p: 'plus', r: 'daring', k: 'join', q: 'Thanksgiving became official in 1863. It takes place in November. → Thanksgiving, ___ ___ ___ ___ ___, became official in 1863.', a: ['which takes place in november'], en: 'Non-defining relative with which, between commas.' },
        { p: 'plus', r: 'daring', k: 'join', q: 'Abraham Lincoln made it official. He was president in 1863. → Abraham Lincoln, ___ ___ ___ ___ ___, made it official.', a: ['who was president in 1863'], en: 'Non-defining relative with who.' },
        { p: 'plus', r: 'daring', q: '___ Halloween started in Europe, it is now very popular in the USA.', a: ['although', 'even though'], en: 'Concession.' },
        { p: 'plus', r: 'daring', q: 'Many families love the feast. ___, some Native Americans see it as a day of mourning. (3 words)', a: ['on the other hand'], en: 'Contrast between two sentences.' },
        { p: 'plus', r: 'daring', k: 'fix', q: '“Diwali, that is celebrated in autumn, is known as the festival of lights.” → ___', a: ['which'], en: 'Non-defining relatives never use that.' },
        { p: 'plus', r: 'daring', a: [], own: { must: [',\\s*(which|who)\\b', '\\b(although|even though)\\b'], min: 12 }, q: 'Write about a celebration: give extra information with <b>, which … ,</b> or <b>, who … ,</b> and use <b>although</b> or <b>even though</b>.', show: 'Although it is a Celtic tradition, Halloween, which takes place on 31 October, is now very commercial.', en: 'Use , which / , who … and although / even though.' },
        /* -ed / -ing, every route (Roger, 9 Nov 2026: in Grammar, not in Vocabulary) */
        { p: 'feel', opts: ['excited', 'exciting', 'bored'], q: 'The children can’t sleep: they are very ___ about the party.', a: ['excited'], d: ['exciting', 'bored'], ca: 'Com et sents: -ed.', en: 'How you feel: -ed.' },
        { p: 'feel', opts: ['amazing', 'amazed', 'bored'], q: 'The fireworks were ___: everybody shouted “Wow!”', a: ['amazing'], ca: 'Com eren els focs: -ing.', en: 'What they were like: -ing.' },
        { p: 'feel', opts: ['disappointed', 'disappointing', 'excited'], q: 'I was ___ when the party finished so early.', a: ['disappointed'], ca: 'Com et vas sentir: -ed.', en: 'How you felt: -ed.' },
        { p: 'feel', r: 'safe', k: 'fix', q: '“The parade was very excited!” → The parade was very ___.', a: ['exciting'], en: 'What the parade was like: -ing.' },
        { p: 'feel', r: 'safe', k: 'fix', q: '“I was very boring during the long speech.” → I was very ___ during the long speech.', a: ['bored'], en: 'How you felt: -ed (boring = a boring person!).' },
        { p: 'feel', r: 'safe', k: 'change', q: '“The film frightened me.” → The film was ___. I was ___.', a: ['frightening frightened'], show: 'frightening … frightened', en: 'The film → -ing · I → -ed.' },
        { p: 'feel', r: 'insecure', opts: ['frightened', 'frightening', 'interesting'], q: 'My little brother was ___ of the scary costumes.', a: ['frightened'], ca: 'Com se sentia: -ed.', en: 'How he felt: -ed.' },
        { p: 'feel', r: 'insecure', k: 'fix', q: '“I’m very interesting in the origins of Halloween.” → I’m very ___ in the origins of Halloween.', a: ['interested'], ca: 'Com et sents: -ed (interested in).', en: 'How you feel: interested in.' },
        { p: 'feel', only: ['beginners', 'insecure'], opts: ['tired', 'tiring', 'boring'], q: 'After dancing all night, we were very ___.', a: ['tired'], d: ['tiring', 'boring'], ca: 'Com et sents: -ed.', en: 'How you feel: -ed.' },
        { p: 'feel', opts: ['boring', 'bored', 'exciting'], q: 'The speech was very long and ___.', a: ['boring'], d: ['bored', 'exciting'], ca: 'Com és la cosa: -ing.', en: 'What it is like: -ing.' },
        { p: 'feel', r: 'insecure', q: 'Walking from house to house for three hours is very ___ (tire).', a: ['tiring'], ca: 'Com és l’activitat: -ing.', en: 'What the activity is like: -ing.' },
        { p: 'feel', r: 'insecure', only: ['insecure'], opts: ['interesting', 'interested', 'tired'], q: 'The story behind Halloween is really ___.', a: ['interesting'], d: ['interested', 'tired'], ca: 'Com és la cosa: -ing.', en: 'What it is like: -ing.' },
        { p: 'feel', r: 'insecure', only: ['insecure'], q: 'We were ___ by the Diwali lights: we had never seen anything like them.', a: ['amazed'], d: ['amazing', 'bored'], ca: 'Com us vau sentir: -ed.', en: 'How you felt: -ed.' },
        { p: 'feel', r: 'insecure', only: ['insecure'], q: 'It rained all day, so the parade was ___.', a: ['disappointing'], d: ['disappointed', 'exciting'], ca: 'Com va ser la desfilada: -ing.', en: 'What the parade was like: -ing.' },
        { p: 'feel', r: 'insecure', q: 'Are you ___ (interest) in the history of Diwali?', a: ['interested'], ca: 'Com et sents: interested in.', en: 'How you feel: interested in.' },
        { p: 'feel', r: 'safe', q: 'Many people are ___ (surprise) to learn that the first jack-o’-lanterns were turnips.', a: ['surprised'], d: ['surprising', 'interesting'], ca: 'Com se senten: -ed.', en: 'How they feel: -ed.' },
        { p: 'feel', r: 'daring', q: 'The end of the story was ___ (surprise), so all the readers were ___ (surprise).', a: ['surprising surprised'], show: 'surprising … surprised', en: 'The end → -ing · the readers → -ed.' },
        { p: 'feel', a: [], own: { must: ['\\w{3,}ed\\b', '\\w{3,}ing\\b'], min: 8 }, q: 'Write how you feel at a celebration (<b>-ed</b>) and what something there is like (<b>-ing</b>).', show: 'At Christmas I’m excited because the presents are amazing.', ca: 'Una paraula en -ed i una en -ing. Per exemple: <em>At Christmas I’m excited because the food is amazing.</em>', en: 'One -ed word and one -ing word.' }
      ] },
    { id: 'mixed', type: 'typed', mode: 'say', tab: { ca: 'Barreja', en: 'Mixed' }, title: { ca: 'Pràctica barrejada', en: 'Mixed practice: choose the form' }, pill: { ca: 'Respon-ho tot', en: 'Answer all' },
      intro: { ca: 'Barreja de formes: decideix primer quina necessites.', en: 'Mixed forms: decide which one you need first.' },
      items: [
        { q: 'We celebrate it ___ 26 November.', a: ['on'] },
        { q: 'She ___ (love) the parade.', a: ['loves'] },
        { q: 'My brother ___ (like) the fireworks.', a: ['likes'] },
        { q: 'I love Christmas ___ we eat together.', a: ['because'] },
        { q: 'First, we clean the house. ___, we decorate it.', a: ['then', 'after that'] },
        { r: 'insecure', only: ['insecure'], q: 'The Castanyada ___ ___ on 31 October. (es fa)', a: ['is held'], ca: 'Costum: It is held on + data.', en: 'Custom: It is held on + date.' },
        { r: 'insecure', only: ['insecure'], q: 'My cousins ___ (not / celebrate) Halloween.', a: ["don't celebrate", 'do not celebrate'], ca: 'Negatiu: don’t + verb.', en: 'Negative: don’t + verb.' },
        { r: 'safe', q: 'In 1863, Lincoln ___ Thanksgiving official. (used to make / made)', a: ['made'], en: 'One finished event in 1863.' },
        { r: 'safe', q: 'My grandparents ___ ___ roast chestnuts in the street. (used to / use to)', a: ['used to'], en: 'Affirmative: used to.' },
        { r: 'safe', q: 'That’s the shop ___ sells panellets.', a: ['which', 'that'] },
        { r: 'daring', q: 'The Castanyada, ___ is held on 31 October, is a family celebration.', a: ['which'] },
        { r: 'daring', q: '___ it is commercialised, Halloween is still fun for children.', a: ['although', 'even though'] }
      ] },
    { id: 'write', type: 'writing', product: 2, tab: { ca: 'Escriptura', en: 'Writing' }, title: { ca: 'Peça 2: la nostra celebració', en: 'Piece 2: our celebration' },
      intro: { ca: 'Escriu sobre la celebració que ha triat el teu grup. És la segona peça del producte final.', en: 'Write about your group’s celebration. This is the second piece of your final product.' },
      task: { beginners: 'Explica la celebració del teu grup (40–55 paraules) amb la pauta: què és, quan és, tres costums amb <em>First / Then / Finally</em>, un menjar i per què t’agrada (<em>because</em>).<br><strong>Banc de paraules:</strong> decorate · light candles · dress up · sing · dance · eat together · fireworks · presents · lights · colourful · fun', insecure: 'Explica la celebració del teu grup (60–80 paraules): què és, quan és (data amb ordinal), tres costums, un menjar o símbol i per què t’agrada. Fes servir <em>First / Then / Finally</em> i <em>because</em>. Afegeix una cosa que t’interessa o que respectes d’aquesta celebració.', safe: 'Compare your group’s celebration with a local one (100–130 words): two similarities, two differences (both… and, whereas, similar to, different from) and one sentence about its origin (Past Simple / used to).', daring: 'Write about your group’s celebration (140–180 words): its origin, meaning and how it has changed over time (used to, keep a tradition alive, commercialised, evolve), a comparison with a local celebration, and one sentence on how to present it without stereotypes.' },
      frame: { beginners: '<strong>Pauta:</strong> ___ is celebrated on / in ___. First, people ___. Then, they ___. Finally, families ___. We eat ___. I like it because ___.', insecure: '<strong>Pauta:</strong> ___ is celebrated on the ___ of ___. First, people ___. Then, ___. Finally, ___. We eat ___. I like it because ___. I find it interesting that ___.' },
      min: { beginners: 40, insecure: 60, safe: 100, daring: 140 },
      checklist: { beginners: ['It is celebrated on / in…', 'First / Then / Finally', 'because', 'Un menjar'], insecure: ['Data amb ordinal (the twenty-fifth…)', 'First / Then / Finally', 'because', 'Tres costums i un menjar o símbol', 'Una cosa que m’interessa o respecto'], safe: ['Two similarities with both… and / similar to', 'Two differences with whereas / different from', 'One origin sentence (Past Simple or used to)', 'At least one relative clause'], daring: ['Origin and meaning', 'How it has changed (used to, evolve…)', 'Comparison with a local celebration', 'A non-defining relative clause', 'How to avoid stereotypes'] } },
    { id: 'speak', type: 'speaking', tab: 'Speaking', title: { ca: 'Speaking: compara-ho', en: 'Speaking: compare' },
      intro: { ca: 'Grava’t parlant de la celebració del teu grup. Mira les notes, no llegeixis.', en: 'Record yourself talking about your group’s celebration. Use notes; don’t read.' },
      task: { beginners: 'Digues tres frases sobre la celebració del teu grup amb First / Then / Finally (20–30 segons). Fes servir el model.', insecure: 'Digues quatre frases sobre la celebració del teu grup amb connectors (30–45 segons).', safe: 'Compare your group’s celebration with a local celebration (60–90 s).', daring: 'Compare your group’s celebration with a local one and explain how it has changed over time (90–120 s).' },
      model: { beginners: 'First, people clean their houses. Then, they light lamps. Finally, families eat sweets. I like Diwali because it is colourful.', insecure: 'Diwali is celebrated in October or November. First, people clean their homes and decorate them with lights. Then, they light diyas, small oil lamps. Finally, families share sweets and watch the fireworks. I like it because it is colourful, but it is also about family.', safe: 'Both Diwali and Christmas are festivals of light, and families exchange gifts in both. However, Diwali lasts five days, whereas Christmas is mainly one or two days. Diwali is a very old festival which comes from India.', daring: 'Diwali, which is a very old festival, is similar to Christmas because both use light as a symbol. In the past, families used to make all their sweets at home, whereas today many people buy them, so it has become more commercialised. Even so, families keep the tradition alive.' } },
    { id: 'talk', type: 'talk', tab: { ca: 'Conversa', en: 'Talk' }, title: { ca: 'Conversa: d’on ve?', en: 'Talk: where does it come from?' },
      intro: { ca: 'Un company del grup et fa preguntes sobre la celebració que investigueu.', en: 'A teammate asks you about the celebration your group is researching.' },
      task: { beginners: 'Respon amb frases curtes: el nom, quan és i dos costums. Fes servir el model.', insecure: 'Respon amb frases completes. Fes servir It comes from… / People used to… / Now people…', safe: 'Answer in two or three sentences each. Use used to, a relative clause (who / which / where) and a comparison (older than, more… than).', daring: 'Answer in detail. Compare the past and the present, give your opinion and contrast ideas with although or while.' },
      partner: [
        { q: 'Which celebration is your group researching?', ca: 'Quina celebració investigueu?' },
        { q: 'When do people celebrate it?', ca: 'Quan la celebra la gent?' },
        { q: 'What do people do?', ca: 'Què fa la gent?' },
        { r: 'insecure', q: 'Where does it come from?', ca: 'D’on ve?' },
        { r: 'safe', q: 'What did people use to do in the past?' },
        { r: 'safe', q: 'Is it older than Halloween?' },
        { r: 'daring', q: 'How has it changed, and do you think the change is good?' }
      ],
      model: { beginners: 'We are researching Hanukkah. It is in December. People light candles. They eat latkes.', insecure: 'We are researching Hanukkah. It is in December and it lasts eight nights. People light candles on the menorah and eat latkes. It comes from an old story in Jerusalem.', safe: 'Our group is researching Hanukkah, the Jewish festival of lights. It usually takes place in December and lasts eight nights. Families light one more candle every evening and eat food cooked in oil, like latkes. It comes from a story about the Temple in Jerusalem, which is more than two thousand years old, so it’s older than Halloween.', daring: 'We’re researching Hanukkah, which is the Jewish festival of lights. It lasts eight nights, usually in December. Families light one more candle on the menorah every evening, and grandparents often tell the old story of the oil that burned for eight days in Jerusalem. It’s about two thousand years old, so it’s older than Halloween. Although the story is very old, some things have changed: now there are big public menorahs in city squares, and many families give presents. I think that’s good, because more people learn about it.' } }
  ]
};
