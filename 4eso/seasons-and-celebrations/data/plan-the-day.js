/* LS2 · Learning Path 5 · Plan the day (approved content, docs/4eso/ls2-seasons-and-celebrations/overview.md) */
window.LP = {
  key: 'ls2Plan4ESO', n: 5, starter: true, title: 'Plan the day',
  panels: [
    { id: 'recall', type: 'recall', tab: 'Recall', title: { ca: 'Recall: Learning Paths 2–4', en: 'Recall: Learning Paths 2–4' }, pill: { ca: 'Sense apunts', en: 'No notes' },
      intro: { ca: 'Escriu les respostes sense mirar res.', en: 'Type the answers without looking.' },
      items: [
        { q: 'How many sources do you need for each fact? (a number word)', a: ['two', '2'] },
        { r: 'insecure', q: 'If you can’t find who wrote it, be ___.', a: ['careful'] },
        { r: 'insecure', q: 'For many Hindus, Diwali ___ light winning over darkness.', a: ['celebrates'] },
        { q: 'Hanukkah ___ (last) eight nights.', a: ['lasts'] },
        { q: 'In winter the days get ___.', a: ['shorter'] },
        { r: 'insecure', q: '1/11 → on the ___ of November', a: ['first', '1st'] },
        { r: 'safe', q: 'People ___ ___ carve turnips.', a: ['used to'] },
        { r: 'safe', q: 'The Wampanoag were the people ___ lived there.', a: ['who', 'that'] },
        { r: 'daring', q: 'People carve pumpkins. → Pumpkins ___ ___.', a: ['are carved'] },
        { r: 'daring', q: '___ it is commercialised, it’s still fun.', a: ['although', 'even though'] }
      ] },
    { id: 'vocab', type: 'vocab', practiceMode: 'listen', tab: { ca: 'Vocabulari', en: 'Vocabulary' }, title: { ca: 'Organitzar un esdeveniment', en: 'Planning an event' },
      intro: { ca: 'Explora, practica amb les targetes i completa les frases.', en: 'Explore, practise with the cards and complete the sentences.' },
      core: { beginners: ['meet friends', 'buy tickets', 'invite people'], insecure: ['go to a festival', 'meet friends', 'book a room', 'buy tickets', 'invite people'], safe: ['go to a festival', 'meet friends', 'book a room', 'buy tickets', 'invite people', 'organise', 'set up', 'put up posters / decorations', 'send invitations', 'make a timetable', 'run a stall / workshop', 'take place', 'be held', 'book a band / a room'], daring: ['go to a festival', 'meet friends', 'book a room', 'buy tickets', 'invite people', 'organise', 'set up', 'put up posters / decorations', 'send invitations', 'make a timetable', 'run a stall / workshop', 'take place', 'be held', 'book a band / a room'] },
      groups: [
        { g: 'Plans', items: [['go to a festival', 'anar a un festival', 'We’re going to go to a festival.'], ['meet friends', 'quedar amb amics', 'I’ll meet friends in the square.'], ['book a room', 'reservar una sala', 'We need to book a room.'], ['buy tickets', 'comprar entrades', 'Can you buy tickets?'], ['invite people', 'convidar gent', 'We’re going to invite people.']] },
        { r: 'safe', g: 'Event planning (Safe)', items: [['organise', 'organitzar', 'We’re organising a celebration day.'], ['set up', 'muntar, preparar', 'We set up the chairs at 9.'], ['put up posters / decorations', 'penjar cartells / decoració', 'Let’s put up posters.'], ['send invitations', 'enviar invitacions', 'We’re sending invitations on Wednesday.'], ['make a timetable', 'fer un horari', 'We need to make a timetable.'], ['run a stall / workshop', 'portar una parada / un taller', 'Our class runs a food stall.'], ['take place', 'tenir lloc', 'It takes place in the hall.'], ['be held', 'celebrar-se, fer-se', 'The event will be held on Friday.'], ['book a band / a room', 'contractar un grup / reservar una sala', 'We booked a band.']] }
      ],
      review: [
        { g: 'Earlier paths', items: [['once a year', 'un cop l’any', 'It happens once a year.'], ['decorate', 'decorar', 'We decorate the hall.'], ['guests', 'convidats', 'We have ten guests.']] },
        { r: 'safe', g: 'Earlier paths', items: [['the school hall', 'la sala d’actes', 'The event is in the school hall.'], ['family-friendly', 'per a tota la família', 'A family-friendly event.']] },
        { r: 'daring', g: 'Earlier paths', items: [['inclusive', 'inclusiu', 'An inclusive event.'], ['stereotype', 'estereotip', 'Avoid stereotypes.']] }
      ],
      practice: [
        { q: 'Let’s ___ our families to the event.', a: ['invite'] },
        { q: 'We need to ___ a room for the workshop.', a: ['book'] },
        { q: 'Can you ___ tickets for the concert?', a: ['buy'] },
        { r: 'safe', q: 'We’re going to ___ ___ posters in the corridors.', a: ['put up'] },
        { r: 'safe', q: 'Our class is going to ___ a food stall.', a: ['run'] },
        { r: 'safe', q: 'Can you ___ ___ the chairs before 9.00?', a: ['set up'] },
        { r: 'safe', q: 'We need to make a ___ so everyone knows what happens and when.', a: ['timetable'] },
        { r: 'safe', q: 'The event will be ___ in the school hall.', a: ['held'] }
      ] },
    { id: 'listen', type: 'mc', tab: 'Listening', title: { ca: 'Listening: reunió del consell d’alumnes', en: 'Listening: student council meeting' }, pill: { ca: 'Respon-ho tot', en: 'Answer all' },
      intro: { ca: 'Escolta la reunió una vegada per la idea general i una altra per als detalls.', en: 'Listen once for the general idea and again for the details.' },
      media: { audio: 'audio/student-council-meeting.mp3', title: 'Student council meeting', script: [
        ['Laia', 'OK, everyone. We’re meeting the head teacher on Monday, so we need a plan today.'],
        ['Omar', 'Right. The event is going to be about festivals of light: Diwali, Hanukkah, Lunar New Year and Christmas.'],
        ['Laia', 'Good. When is it?'],
        ['Omar', 'It’s on Friday the eleventh of December. School finishes at two, so the event starts at ten and finishes at one thirty.'],
        ['Laia', 'Where’s it going to take place?'],
        ['Omar', 'In the school hall. There will be four stalls, one for each festival.'],
        ['Laia', 'What about food?'],
        ['Omar', 'I’ll ask the families. I think a lot of parents will help.'],
        ['Laia', 'Great. And music?'],
        ['Omar', 'My cousin plays in a band. I’ll call him tonight.'],
        ['Laia', 'Perfect. Who’s going to put up the decorations?'],
        ['Omar', 'Class 4B is going to make paper lanterns in Art.'],
        ['Laia', 'And the invitations?'],
        ['Omar', 'We’re sending them on Wednesday. We’re going to invite families and the primary school.'],
        ['Laia', 'OK. One problem: the hall is small. What if it rains and everyone is inside?'],
        ['Omar', 'Don’t worry. We’ll use the gym too.'],
        ['Laia', 'Good idea. I think it’ll be the best day of the term!']] },
      chunks: ['The event is going to be', 'I’ll call him tonight', 'We’re sending them on Wednesday'],
      items: [
        { q: 'What is the event about?', o: ['festivals of light', 'harvest festivals', 'Halloween'], h: 'Escolta el principi.' },
        { q: 'When is it?', o: ['Friday 11 December', 'Monday 11 December', 'Friday 1 December'], h: 'Escolta el dia de la setmana i la data.' },
        { q: 'Where is it going to take place?', o: ['in the school hall', 'in the gym', 'in the town square'], h: 'Escolta “Where’s it going to take place?”.' },
        { q: 'How many stalls will there be?', o: ['four', 'two', 'six'], h: 'Una per a cada festival.' },
        { q: 'Who is going to make paper lanterns?', o: ['Class 4B', 'the families', 'the band'], h: 'Escolta la pregunta sobre la decoració.' },
        { r: 'insecure', q: 'Who will Omar call tonight?', o: ['his cousin', 'the head teacher', 'the primary school'], h: 'Escolta la part de la música.' },
        { r: 'safe', q: 'When are they meeting the head teacher?', o: ['on Monday', 'on Wednesday', 'on Friday'] },
        { r: 'safe', q: 'What is the solution if it rains?', o: ['They’ll use the gym too.', 'They’ll cancel it.', 'They’ll go outside.'] },
        { r: 'daring', q: '“I’ll call him tonight.” This is…', o: ['a decision made now', 'an arrangement', 'a timetable'] },
        { r: 'daring', q: '“We’re sending them on Wednesday.” This is…', o: ['an arrangement', 'a prediction', 'a decision made now'] }
      ] },
    { id: 'again', type: 'mc', tab: { ca: 'Torna a escoltar', en: 'Listen again' }, title: { ca: 'Torna a escoltar: com es prepara una celebració', en: 'Listen again: getting ready for a celebration' }, pill: { ca: 'Vídeo', en: 'Video' },
      intro: { ca: 'Escolta la Mei de l’LP3: com es prepara la seva família i qui fa què. T’ajudarà a planificar el vostre dia.', en: 'Listen to Mei from LP3: how does her family get ready, and who does what? It will help you plan your day.' },
      media: { videos: [{ base: 'video/mei-lunar-new-year', title: 'Mei: Lunar New Year' }], videoCredit: 'Illustrated video made for English Lab. Voices generated with ElevenLabs.' },
      chunks: ['we clean the whole flat', 'We make dumplings together'],
      items: [
        { q: 'What does Mei’s family do a few days before?', o: ['They clean the whole flat.', 'They buy new clothes.', 'They send invitations.'], h: 'Escolta “A few days before…”.' },
        { q: 'Who comes from Liverpool?', o: ['her grandparents', 'her cousins', 'her brother'], h: 'Escolta “On New Year’s Eve…”.' },
        { q: 'What do they make together?', o: ['dumplings', 'lanterns', 'posters'], h: 'Escolta la part del sopar.' },
        { q: 'What do the children get?', o: ['red envelopes with money', 'new toys', 'sweets'], h: 'Escolta “Then the children get…”.' },
        { q: 'Where do they watch the dragon dance?', o: ['in Chinatown', 'in the school hall', 'at home'], h: 'Escolta “we go to…”.' },
        { r: 'insecure', q: 'What is the best moment for Mei?', o: ['making dumplings together', 'the dragon dance', 'cleaning the flat'], h: 'Escolta “For me, that’s the best moment”.' },
        { r: 'safe', q: 'Why do they clean the flat?', o: ['to sweep away bad luck', 'because guests are coming', 'because it’s a family rule'] },
        { r: 'safe', q: 'Which idea from Mei could make your event feel welcoming?', o: ['an activity everyone does together, like making food', 'a long talk about history', 'a quiz with prizes only for the winners'] },
        { r: 'daring', q: '“Not every family celebrates it in the same way.” Why is this useful for your event plan?', o: ['It reminds you to show customs without saying everyone does them.', 'It means you should not include Lunar New Year.', 'It shows that the customs are not real.'] },
        { r: 'daring', q: '“Nobody is looking at their phone.” What does Mei mean?', o: ['Everyone is really together and enjoying it.', 'Phones are not allowed at dinner.', 'She has lost her phone.'] }
      ] },
    { id: 'shadow', type: 'shadow', tab: { ca: 'Shadowing', en: 'Shadowing' }, title: { ca: 'Shadowing · Student council meeting', en: 'Shadowing · Student council meeting' }, pill: '3 ×',
      intro: { ca: 'Repeteix un tros de l’escolta just darrere de la veu, com una ombra.', en: 'Repeat part of the listening just behind the speaker, like a shadow.' },
      clip: { title: 'Student council meeting', src: 'audio/student-council-meeting.mp3', slow: 'audio/student-council-meeting-slow.mp3', t: [0, 34.32], ts: [0, 42.78], lines: [
        ['Laia', 'OK, everyone. We’re meeting the head teacher on Monday, so we need a plan today.'],
        ['Omar', 'Right. The event is going to be about festivals of light: Diwali, Hanukkah, Lunar New Year and Christmas.'],
        ['Laia', 'Good. When is it?'],
        ['Omar', 'It’s on Friday the eleventh of December. School finishes at two, so the event starts at ten and finishes at one thirty.'],
        ['Laia', 'Where’s it going to take place?'],
        ['Omar', 'In the school hall. There will be four stalls, one for each festival.'],
        ['Laia', 'What about food?'],
        ['Omar', 'I’ll ask the families. I think a lot of parents will help.']], marks: [["O**K**, ↗ **ev**eryone. ↘", "We’re **meet**ing the **head** teacher on **Mon**day, ↗ so we need‿a **plan** to**day**. ↘"], ["**Right**. ↘ The e**vent**‿is going to be a**bout** **fes**tivals‿of **light**: Di**wa**li, ↗ **Ha**nukkah, ↗ **Lu**nar New **Year** and **Christ**mas. ↘"], ["**Good**. ↘ **When**‿is‿it? ↘"], ["It’s‿on **Fri**day the e**lev**enth of De**cem**ber. ↘", "**School** **fin**ishes‿at **two**, ↗ so the e**vent** **starts**‿at **ten** and **fin**ishes at **one** **thir**ty. ↘"], ["**Where’s**‿it going to take **place**? ↘"], ["In the **school** **hall**. ↘", "There will be **four** **stalls**, ↗ one for‿**each** **fes**tival. ↘"], ["What‿a**bout** **food**? ↘"], ["I’ll‿**ask** the **fam**ilies. ↘", "I **think**‿a **lot**‿of **par**ents will **help**. ↘"]], cues: [[0.03, 1.27, 0.05, 1.5], [1.27, 5.08, 1.5, 5.97], [5.2, 12.75, 6.48, 15.41], [12.88, 14.75, 15.9, 18.01], [14.96, 17.17, 18.68, 21.25], [17.25, 22.13, 21.36, 27.06], [22.23, 24.42, 27.58, 29.99], [24.65, 26.09, 30.79, 32.46], [26.09, 29.27, 32.46, 36.24], [29.41, 30.87, 36.75, 38.47], [31.02, 32.39, 38.98, 40.56], [32.4, 34.22, 40.61, 42.68]] } },
    { id: 'grammar', type: 'typed', mode: 'listen', tab: { ca: 'Gramàtica', en: 'Grammar' }, title: { ca: 'Formes de futur', en: 'Future forms' }, pill: { ca: 'Respon-ho tot', en: 'Answer all' },
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
          { ca: head('🔮', 'Parlar del futur: <em>going to</em>, <em>will</em>, <em>There will be</em>', 'Depèn de <b>quan</b> has pres la decisió.') +
              row(card('blue', '🗓 going to = un PLA que ja tens', ex('We’re <b>going to decorate</b> the hall.', 'ja ho hem decidit') + ex('Ana is <b>going to make</b> the posters.', 'ja té el paper') + small('am / is / are + going to + verb')),
                card('orange', '⚡ will = ho decideixes ARA / t’ofereixes', ex('“We need music!” “I’<b>ll bring</b> my speaker!”') + ex('“It’s cold.” “I’<b>ll close</b> the window.”') + small('will (’ll) + verb, igual per a tothom')),
                card('green', '🎪 There will be + nom', ex('<b>There will be</b> music and food.') + ex('<b>There will be</b> four stalls.') + small('= hi haurà'))) +
              table([['', 'going to', 'will'], ['➕', 'We’re <b>going to</b> invite families.', 'I’<b>ll</b> help you.'], ['➖', 'We <b>aren’t going to</b> invite other schools.', 'I <b>won’t</b> be late.'], ['❓', '<b>Are</b> you <b>going to</b> come?', '<b>Will</b> you help me?']]) +
              mistakes('Compte!', bad('We going to decorate.', 'We<b>’re</b> going to decorate.', '(falta are)'), bad('I will to bring the music.', 'I’ll <b>bring</b> the music.', '(sense to)'), bad('There will have music.', 'There will <b>be</b> music.')) +
              together(true, ['“The bin is full!” “I ___ take it out!”', '’ll (will)'], ['We decided last week: we ___ ___ ___ have a party on Friday.', '’re going to'], ['___ ___ ___ a DJ and a cake. (hi haurà)', 'There will be']) +
              turn('Ara tu:', 'un pla per al cap de setmana (<em>going to</em>) i una oferta per ajudar un company (<em>I’ll…</em>).'),
            en: head('🔮', 'Talking about the future: <em>going to</em>, <em>will</em>, <em>There will be</em>', 'It depends on <b>when</b> you made the decision.') +
              row(card('blue', '🗓 going to = a PLAN you already have', ex('We’re <b>going to decorate</b> the hall.', 'we decided before') + ex('Ana is <b>going to make</b> the posters.', 'she bought the paper') + small('am / is / are + going to + verb')),
                card('orange', '⚡ will = you decide NOW / you offer', ex('“We need music!” “I’<b>ll bring</b> my speaker!”') + ex('“It’s cold.” “I’<b>ll close</b> the window.”') + small('will (’ll) + verb, the same for everybody')),
                card('green', '🎪 There will be + noun', ex('<b>There will be</b> music and food.') + ex('<b>There will be</b> four stalls.'))) +
              table([['', 'going to', 'will'], ['➕', 'We’re <b>going to</b> invite families.', 'I’<b>ll</b> help you.'], ['➖', 'We <b>aren’t going to</b> invite other schools.', 'I <b>won’t</b> be late.'], ['❓', '<b>Are</b> you <b>going to</b> come?', '<b>Will</b> you help me?']]) +
              mistakes('Watch out', bad('We going to decorate.', 'We<b>’re</b> going to decorate.', '(are is missing)'), bad('I will to bring the music.', 'I’ll <b>bring</b> the music.', '(no to)'), bad('There will have music.', 'There will <b>be</b> music.')) +
              together(false, ['“The bin is full!” “I ___ take it out!”', '’ll (will)'], ['We decided last week: we ___ ___ ___ have a party on Friday.', '’re going to'], ['___ ___ ___ a DJ and a cake. (hi haurà)', 'There will be']) +
              turn('Your turn:', 'one plan for the weekend (<em>going to</em>) and one offer to help a classmate (<em>I’ll…</em>).') },
          { r: 'safe', en: head('📅', 'Three more futures', 'For a real event you need more than <em>going to</em> and <em>will</em>.') +
              row(card('purple', '🤝 Present Continuous = ARRANGED with someone', ex('We’<b>re meeting</b> the head teacher on Monday at 9.') + ex('We’<b>re performing</b> a dance at 12.') + small('It’s in the diary: a day, a time, other people.')),
                card('teal', '🕙 Present Simple = the TIMETABLE', ex('The event <b>starts</b> at 10.00.') + ex('The bus <b>leaves</b> at 8.15 tomorrow.') + small('Programmes, timetables, opening hours.')),
                card('orange', '🔮 will = a PREDICTION (your opinion)', ex('I think everyone <b>will love</b> it.') + ex('It <b>will be</b> a great day.') + small('Often with <em>I think, I’m sure, probably</em>.'))) +
              mistakes('Watch out', bad('We will meet the head teacher on Monday at 9.', 'We’<b>re meeting</b> the head teacher on Monday at 9.', '(it’s arranged)'), bad('The event is starting at 10.00.', 'The event <b>starts</b> at 10.00.', '(timetable)')) +
              together(false, ['The film ___ (start) at 8.00. (cinema timetable)', 'starts'], ['We ___ ___ (meet) Ms Puig tomorrow at 9. (it’s in her diary)', '’re meeting']) +
              turn('Your turn:', 'one arrangement you have this week, one timetable (school, bus, match) and one prediction about the celebration day.') },
          { r: 'daring', en: head('🧭', 'One plan, five futures', 'Choose the form by the <b>reason</b>, not by the time.') +
              table([['Why?', 'Form', 'Example'], ['🗓 decided before', 'going to', 'We’re <b>going to set up</b> four stalls.'], ['🤝 arranged with someone', 'Present Continuous', 'We’<b>re meeting</b> the head teacher on Monday.'], ['🕙 on the programme', 'Present Simple', 'The doors <b>open</b> at 9.30.'], ['⚡ decided now / offered', 'will', '“Nobody has a speaker.” “I’<b>ll bring</b> mine.”'], ['🔮 an opinion', 'will', 'I think it <b>will be</b> a success.'], ['👀 you can SEE it coming', 'going to', 'Look at those clouds! It’s <b>going to rain</b>.']]) +
              mistakes('Watch out', bad('Look at those clouds! It will rain.', 'It’s <b>going to</b> rain.', '(you can see it)'), bad('We will use the hall on Friday. (she has said yes)', 'We’<b>re using</b> the hall on Friday.')) +
              together(false, ['Look at those clouds! It ___ ___ ___ (snow).', '’s going to snow'], ['I think the party ___ ___ (be) great.', 'will be']) +
              turn('Your turn:', 'write your plan for the day with at least four of the five futures and say why you chose each one.') }
        ];
      })(),
      items: [
        { q: 'We ___ ___ ___ (decorate) the hall. It’s our plan.', a: ['are going to decorate', "'re going to decorate"], ca: 'Pla → going to.', en: 'A plan → going to.' },
        { q: '“We need music!” “I ___ bring my speaker!”', a: ['will', "'ll"], ca: 'Oferta → will.', en: 'Offer → will.' },
        { q: '___ ___ ___ music and food.', a: ['there will be'], ca: 'There will be + nom.', en: 'There will be + noun.' },
        { q: 'Ana ___ ___ ___ (make) the posters. She bought the paper yesterday.', a: ['is going to make', "'s going to make"], ca: 'Ja ho té planejat → going to.', en: 'Already planned → going to.' },
        { q: '“It’s cold in here.” “I ___ close the window.”', a: ['will', "'ll"], ca: 'Decisió ara → will.', en: 'Decision now → will.' },
        { r: 'insecure', q: 'We ___ ___ ___ (not / invite) other schools.', a: ["aren't going to invite", 'are not going to invite'], ca: 'Negativa: aren’t going to.', en: 'Negative: aren’t going to.' },
        { r: 'insecure', q: '___ you going to come?', a: ['are'], ca: 'Pregunta: Are you going to…?', en: 'Question: Are you going to…?' },
        { q: 'There ___ ___ four stalls.', a: ['will be'], ca: 'There will be.', en: 'There will be.' },
        { r: 'safe', q: 'We ___ ___ (meet) the head teacher on Monday at 9. It’s in her diary.', a: ['are meeting', "'re meeting"], en: 'Arrangement → Present Continuous.' },
        { r: 'safe', q: 'The event ___ (start) at 10.00.', a: ['starts'], en: 'Timetable → Present Simple.' },
        { r: 'safe', q: 'I think everyone ___ ___ (love) it.', a: ['will love', "'ll love"], en: 'Prediction → will.' },
        { r: 'safe', q: 'The bus ___ (leave) at 8.15 tomorrow.', a: ['leaves'], en: 'Timetable → Present Simple.' },
        { r: 'safe', q: 'We ___ ___ (perform) a dance at 12. We booked the hall yesterday.', a: ['are performing', "'re performing"], en: 'Arrangement → Present Continuous.' },
        { r: 'daring', q: 'Look at those dark clouds! It ___ ___ ___ (rain) before the parade.', a: ['is going to rain', "'s going to rain"], en: 'A prediction you can see coming → going to.' },
        { r: 'daring', q: 'The head teacher has said yes: we ___ ___ (use) the hall on Friday.', a: ['are using', "'re using"], en: 'Arranged with another person → Present Continuous.' },
        { r: 'daring', q: 'The doors ___ (open) at 9.30, and the event finishes at 13.00.', a: ['open'], en: 'On the programme → Present Simple.' },
        { r: 'daring', q: '“Nobody has a speaker.” “Don’t worry, I ___ ___ (bring) mine.”', a: ['will bring', "'ll bring"], en: 'Offered now → will.' },
        { r: 'daring', q: 'Correct it: “We will meet the head teacher on Monday at 9. It’s in her diary.” → We ___ ___ the head teacher on Monday at 9.', a: ['are meeting', "'re meeting"], en: 'It is already arranged, so Present Continuous, not will.' }
      ] },
    { id: 'mixed', type: 'typed', mode: 'say', tab: { ca: 'Quin futur?', en: 'Which future?' }, title: { ca: 'Quin futur? (barrejat)', en: 'Which future? (mixed)' }, pill: { ca: 'Respon-ho tot', en: 'Answer all' },
      intro: { ca: 'Pensa per què: decisió ara, pla, oferta…', en: 'Think why: decision now, plan, arrangement, timetable or prediction.' },
      items: [
        { q: '“The printer doesn’t work.” “OK, I ___ ask the office.”', a: ['will', "'ll"], ca: 'Decisió ara.', en: 'Decision now.' },
        { q: 'Next year, I ___ ___ ___ join the student council. I’ve decided.', a: ['am going to', "'m going to"], ca: 'Pla.', en: 'Plan.' },
        { q: '___ ___ ___ a stall for each festival.', a: ['there will be'], ca: 'There will be.', en: 'There will be.' },
        { q: '“These boxes are heavy.” “I ___ help you!”', a: ['will', "'ll"], ca: 'Oferta.', en: 'Offer.' },
        { q: 'Class 4B ___ ___ ___ (make) lanterns in Art. It’s the plan.', a: ['is going to make', "'s going to make"], ca: 'Pla.', en: 'Plan.' },
        { r: 'insecure', only: ['insecure'], q: '“We need posters!” “I ___ make them!”', a: ['will', "'ll"], ca: 'Oferta.', en: 'Offer.' },
        { r: 'insecure', only: ['insecure'], q: 'We ___ ___ ___ (decorate) the hall on Friday. It’s the plan.', a: ['are going to decorate', "'re going to decorate"], ca: 'Pla.', en: 'Plan.' },
        { r: 'safe', q: 'The concert ___ (start) at 12.30, according to the programme.', a: ['starts'], en: 'Timetable.' },
        { r: 'safe', q: 'We ___ ___ (visit) our grandparents on Sunday. We’ve already bought the train tickets.', a: ['are visiting', "'re visiting"], en: 'Arrangement.' },
        { r: 'safe', q: 'I’m sure the families ___ ___ (enjoy) the food.', a: ['will enjoy', "'ll enjoy"], en: 'Prediction.' },
        { r: 'daring', q: 'We ___ ___ ___ (raise) money for a charity. We decided it last week.', a: ['are going to raise', "'re going to raise"], en: 'Decided before → going to.' },
        { r: 'daring', q: 'The band ___ (play) at 11.00. It’s on the programme.', a: ['plays'], en: 'On the programme → Present Simple.' }
      ] },
    { id: 'write', type: 'writing', product: 4, tab: { ca: 'El pla', en: 'The plan' }, title: { ca: 'Peça 4: el nostre pla', en: 'Piece 4: our event plan' },
      intro: { ca: 'Fes el pla amb el teu grup i escriu-ne la teva versió.', en: 'Plan with your group and write your own version.' },
      task: { beginners: 'Escriu el pla (30–40 paraules) amb la pauta: dues activitats amb l’hora, el lloc, qui fa què i <strong>una acció perquè tothom s’hi senti benvingut</strong>.<br><strong>Banc de paraules:</strong> music · food · games · dance · lanterns · posters · invite families · explain the customs · the school hall · the gym', insecure: 'Escriu el pla: tres activitats, l’hora, el lloc i qui fa què, una llista de materials i <strong>dues accions perquè tots els alumnes i les famílies s’hi sentin benvinguts</strong> (per exemple: explicar els costums a cada parada, convidar les famílies).', safe: 'Write the plan (100–130 words + a timetable): timetable (Present Simple), roles (going to), materials, arrangements (Present Continuous), one prediction (will) and <strong>two concrete actions so every student and family feels welcome</strong>.', daring: 'Write the plan (140–180 words + a timetable): the Safe plan plus estimated cost and who pays (resources), <strong>two concrete welcome actions for students and families, with a reason for each</strong> (although, on the other hand), and one possible problem with a plan B.' },
      frame: { beginners: '<strong>Pauta:</strong> The event is going to take place in ___ on ___. At ___ o’clock, there will be ___. At ___ o’clock, there will be ___. ___ is going to ___. I’ll ___. To make everyone feel welcome, we will ___.', insecure: '<strong>Pauta:</strong> The event is going to take place in ___ on ___. There will be ___, ___ and ___. ___ is going to ___. I’ll ___. Materials: ___. To make everyone feel welcome, we will ___ and ___.' },
      min: { beginners: 30, insecure: 40, safe: 100, daring: 140 },
      checklist: { beginners: ['Dues activitats amb l’hora', 'El lloc', 'Qui fa què (going to / will)', 'Una acció perquè tothom s’hi senti benvingut'], insecure: ['Tres activitats', 'Hora i lloc', 'Qui fa què (going to / will)', 'Llista de materials', 'Dues accions perquè tothom s’hi senti benvingut'], safe: ['Timetable with Present Simple', 'Roles with going to', 'Materials', 'One arrangement (Present Continuous)', 'One prediction (will)', 'Two concrete welcome actions for students and families'], daring: ['Timetable, roles and materials', 'At least four future forms, each for the right reason', 'Estimated cost and who pays', 'Two welcome actions, each with a reason (although / on the other hand)', 'A possible problem and plan B'] } },
    { id: 'speak', type: 'speaking', tab: 'Speaking', title: { ca: 'Speaking: reunió de planificació', en: 'Speaking: planning meeting' },
      intro: { ca: 'Grava’t explicant el pla.', en: 'Record yourself presenting the plan.' },
      task: { beginners: 'Digues tres frases del pla amb el model (20–30 segons).', insecure: 'Explica quatre frases del pla (30–45 segons).', safe: 'Present the plan (60–90 s).', daring: 'Present the plan and answer two “What if…?” questions: What if it rains? · What if some families don’t celebrate this? · What if there’s no money? (90–120 s)' },
      model: { beginners: 'The event is going to take place in the school hall. There will be music and food. I’ll bring the music.', insecure: 'The event is going to take place in the school hall. There will be music and food. Our class is going to make lanterns. I’ll bring the music.', safe: 'Our Lights of the World Day is on Friday 11 December. It starts at ten and finishes at half past one. Class 4B is going to make the decorations, and we’re meeting the head teacher on Monday. I think everyone will enjoy it.', daring: 'If it rains, we’ll use the gym as well as the hall. Although some families don’t celebrate these festivals, the day is about learning, not belief, so everyone can take part. On the other hand, money is limited, so each stall will cost less than twenty euros.' } },
    { id: 'talk', type: 'talk', tab: { ca: 'Conversa', en: 'Talk' }, title: { ca: 'Conversa: reunió de planificació', en: 'Talk: planning meeting' },
      intro: { ca: 'Una companya del consell d’alumnes et fa preguntes sobre el pla del vostre dia de celebració.', en: 'A student council member asks you about your celebration day plan.' },
      task: { beginners: 'Respon amb frases curtes amb going to i will (We are going to… / I will…). Fes servir el model.', insecure: 'Respon amb frases completes: going to per als plans i will per a les decisions i les ofertes.', safe: 'Answer with the right future form: going to for plans, the Present Continuous for arrangements, the Present Simple for the timetable and will for decisions and predictions.', daring: 'Answer with all the future forms, and when there is a problem, offer a solution (If it rains, we’ll…).' },
      partner: [
        { q: 'What are we going to do on the day?', ca: 'Què farem aquell dia?' },
        { q: 'Where is it going to take place?', ca: 'On serà?' },
        { q: 'We need music. Who can bring it?', ca: 'Necessitem música. Qui la pot portar?' },
        { r: 'insecure', q: 'What time does it start?', ca: 'A quina hora comença?' },
        { r: 'safe', q: 'When are we meeting the head teacher?' },
        { r: 'safe', q: 'How can we make everyone feel welcome?' },
        { r: 'daring', q: 'What if it rains and the hall is too small?' }
      ],
      model: { beginners: 'We are going to have music and food. It is going to take place in the school hall. I will bring the music.', insecure: 'We are going to have four stalls, music and food. It is going to take place in the school hall. I’ll bring the music. It starts at ten o’clock.', safe: 'We’re going to have four stalls, one for each festival, with music, food and a lantern workshop. It’s going to take place in the school hall. I’ll bring my speaker and make a playlist. We’re meeting the head teacher on Monday at nine. To make everyone welcome, we’ll explain each custom with a short sign and invite all the families.', daring: 'We’re going to set up four stalls, one for each festival of light, and there will be music, food and a lantern workshop. It’s going to take place in the school hall, and the event starts at ten. I’ll ask my cousin’s band, and if they can’t come, I’ll make a playlist. We’re meeting the head teacher on Monday morning. To make everyone feel welcome, we’ll explain that not every family celebrates the same way. And if it rains, we’ll open the gym too, so nobody feels crowded.' } }
  ]
};
