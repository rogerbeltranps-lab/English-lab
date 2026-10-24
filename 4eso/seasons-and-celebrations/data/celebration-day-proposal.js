/* LS2 · Final product: Celebration Day Proposal (from the LS2 programme). Delivered through Google Classroom and marked by the teacher. */
(function () {
  const pieceNames = { 1: 'Piece 1 · Description', 2: 'Piece 2 · Our celebration', 3: 'Piece 3 · Research card', 4: 'Piece 4 · Event plan', 5: 'Piece 5 · Email' };
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const pieces = level => {
    let all = {}; try { all = JSON.parse(localStorage.getItem('ls2Products4ESO') || '{}'); } catch (e) {}
    const ca = level === 'insecure';
    return [1, 2, 3, 4, 5].map(n => '<div class="mini-card" style="margin:10px 0"><strong>' + pieceNames[n] + '</strong>' +
      (all[n] ? '<p class="tiny">' + (ca ? 'Desada el ' : 'Saved on ') + new Date(all[n].date).toLocaleDateString() + '</p><div class="model" style="white-space:pre-wrap;font-weight:500">' + esc(all[n].text) + '</div>'
        : '<p class="tiny">' + (ca ? 'Encara no l’has desada al Learning Path corresponent.' : 'Not saved yet in its Learning Path.') + '</p>') + '</div>').join('');
  };
  window.LP = {
    key: 'ls2FinalProduct4ESO', n: 7, title: 'Celebration Day Proposal',
    panels: [
      { id: 'task', type: 'info', tab: { ca: 'La tasca', en: 'The task' }, title: { ca: 'Producte final: Celebration Day Proposal', en: 'Final product: Celebration Day Proposal' },
        html: {
          ca: '<p>En grups de 3–4, dissenyeu un dia de celebració respectuós a l’escola al voltant d’una tradició. Entregueu:</p><ul><li>un <strong>vídeo de grup de 2–3 minuts amb Google Slides</strong>: <strong>tots els membres parlen</strong> i es veu la cara de cadascú i les diapositives alhora (picture-in-picture), amb veu clara;</li><li>un <strong>correu formal individual</strong> a la direcció proposant l’acte.</li></ul><p><strong>Procés:</strong> tria una celebració → recerca (2+ fonts) → notes → planifica l’acte → Google Slides → grava el pitch del grup → escriu el correu formal → revisa → entrega.</p><p><strong>Insecure:</strong> descriu una celebració amb frases curtes: què, quan, on, tres costums, un menjar o símbol. Planifica tres activitats per al dia: per a cada una, a quina hora és i qui la fa. Digueu una idea perquè tothom s’hi senti benvingut. Correu: plantilla guiada amb buits.</p><p>Cadena d’exemple: <em>font</em> “Diwali is celebrated in October or November” → <em>notes</em> “Diwali · Oct/Nov · lights” → <em>diapositiva</em> “Diwali · October or November · festival of lights” → <em>frase oral</em> “Diwali is celebrated in October or November.” → <em>correu</em> “We would like to organise a Diwali day in November.”</p><p>Els significats religiosos es presenten com a informació, no com a creença. Vosaltres trieu quina tradició presenteu.</p><p><strong>Com treballeu:</strong> en grup amb companys de la teva mateixa ruta (el professor fa els grups). Cada membre presenta una part del vídeo: (1) què, quan i on, i un menjar o símbol · (2) tres costums · (3) el nostre dia: tres activitats amb l’hora i qui les fa, i una idea perquè tothom s’hi senti benvingut. A cada pas, entregues aquí una tasca individual, t’autoavalues i pots deixar un comentari al professor.</p>',
          en: '<p>In groups of 3–4, design a respectful celebration day at school around one tradition. Submit:</p><ul><li>a <strong>2–3 minute group video with Google Slides</strong>, <strong>every member speaking</strong> with their <strong>face visible in picture-in-picture</strong> together with the slides, and a clear voice;</li><li>an <strong>individual formal email</strong> to the head teacher proposing the event.</li></ul><p><strong>Process:</strong> choose a celebration → research (2+ sources) → notes → plan the event → Google Slides → record the group pitch → write the formal email → review → submit.</p><p><strong>Safe:</strong> describe the celebration and <strong>compare it with a local one</strong>: similarities and differences. Explain its origin briefly. Plan the day with a timetable, roles and materials. Explain at least one decision that makes the event inclusive. Email: a full formal email in paragraphs.</p><p><strong>Daring:</strong> explain the origin, meaning and how the tradition has changed over time. Plan the day with a timetable, roles, materials and an estimated cost. Justify every choice so the event is inclusive and avoids stereotypes or caricature costumes. Anticipate one concern from the head teacher and answer it in the email.</p><p>Present religious meanings as information, not as belief. You choose which tradition you present.</p><p><strong>How you work:</strong> in a group with classmates of your own route (your teacher makes the groups). Each member presents one part of the video. <strong>Safe:</strong> (1) the celebration and its origin · (2) here and there: comparison with a local celebration · (3) our day: activities and timetable · (4) roles, materials and one inclusive decision. <strong>Daring:</strong> (1) origin and meaning · (2) change over time and comparison with a local celebration · (3) our day: activities, timetable and roles · (4) materials, cost and why every choice is inclusive. In a group of 3, part 4 is shared. At each step you hand in an individual task here, assess yourself and can leave a comment for your teacher.</p>'
        } },
      { id: 'prep', type: 'step', tab: { ca: 'Pas 0 · Les meves peces', en: 'Step 0 · My pieces' }, title: { ca: 'Abans de treballar en grup: les teves peces', en: 'Before the team work: your pieces' },
        intro: { ca: 'Aquí tens el que has desat a cada Learning Path en aquest dispositiu. Si en falta alguna, torna al Learning Path i fes-la. Després explica què vas canviar després del feedback.', en: 'This is what you saved in each Learning Path on this device. If one is missing, go back to its Learning Path and do it. Then explain what you changed after the feedback.' },
        html: pieces,
        check: level => { let all = {}; try { all = JSON.parse(localStorage.getItem('ls2Products4ESO') || '{}'); } catch (e) {} const miss = [1, 2, 3, 4, 5].filter(n => !all[n]); return miss.length ? (level === 'insecure' ? 'Et falten peces: ' : 'Missing pieces: ') + miss.join(', ') + (level === 'insecure' ? '. Fes-les al seu Learning Path abans d’entregar.' : '. Do them in their Learning Path before you hand in.') : ''; },
        fields: [
          { id: 'c1', label: { ca: 'Peça 1: què vas canviar després del feedback, i per què?', en: 'Piece 1: what did you change after the feedback, and why?' }, rows: 2 },
          { id: 'c2', label: { ca: 'Peça 2: què vas canviar després del feedback, i per què?', en: 'Piece 2: what did you change after the feedback, and why?' }, rows: 2 },
          { id: 'c5', label: { ca: 'Peça 5 (correu): què vas canviar després del feedback, i per què?', en: 'Piece 5 (email): what did you change after the feedback, and why?' }, rows: 2 }
        ],
        rate: {
          insecure: ['Tinc les cinc peces', 'He millorat els meus textos després del feedback', 'Sé de què tracta la celebració del meu grup'],
          safe: ['I have all five pieces', 'I improved my texts after the feedback', 'I know what my group’s celebration is about'],
          daring: ['I have all five pieces', 'I improved my texts after the feedback', 'I know what my group’s celebration is about']
        } },
      { id: 'source', type: 'step', tab: { ca: 'Pas 1 · La meva font', en: 'Step 1 · My source' }, title: { ca: 'La meva font (recerca)', en: 'My source (research)' },
        intro: { ca: 'Cada membre del grup busca una font sobre la celebració. Enganxa aquí les teves notes i la referència.', en: 'Each member of the group finds one source about the celebration. Paste your notes and the credit line here.' },
        fields: [
          { id: 'credit', label: { ca: 'Referència: "Títol de la pàgina", web o autor, any', en: 'Credit line: "Title of the page", website or author, year' }, rows: 2 },
          { id: 'notes', label: { ca: '3–5 notes amb les teves paraules (no copiïs frases)', en: '3–5 notes in your own words (do not copy sentences)' }, rows: 5 },
          { id: 'why', r: 'safe', label: { ca: 'Per què és una font fiable?', en: 'Why is it a reliable source? Who wrote it, and why?' }, rows: 2 }
        ],
        rate: {
          insecure: ['La meva font és fiable (sé qui l’ha escrita)', 'Les notes són amb les meves paraules', 'La referència és completa', 'Explico les creences com a informació'],
          safe: ['My source is reliable (I know who wrote it and why)', 'My notes are in my own words', 'My credit line is complete', 'Religious meanings are written as information'],
          daring: ['My source is reliable (I know who wrote it and why)', 'My notes are in my own words', 'My credit line is complete', 'Religious meanings are written as information']
        } },
      { id: 'contribution', type: 'step', tab: { ca: 'Pas 2 · La meva aportació', en: 'Step 2 · My contribution' }, title: { ca: 'La meva aportació al pla i a les diapositives', en: 'My contribution to the plan and the slides' },
        intro: { ca: 'Explica què has fet tu per al pla del dia i enganxa el text de la teva diapositiva.', en: 'Explain what you did for the plan of the day and paste the text of your slide(s).' },
        fields: [
          { id: 'role', label: { ca: 'El meu rol el dia de la celebració', en: 'My role on the celebration day' }, rows: 2 },
          { id: 'plan', label: { ca: 'L’activitat o la part del pla que he preparat (què, a quina hora, qui)', en: 'The activity or part of the plan I prepared' }, rows: 3 },
          { id: 'slide', label: { ca: 'El text de la meva diapositiva', en: 'The text of my slide(s)' }, rows: 4 }
        ],
        rate: {
          insecure: ['He fet la meva part a temps', 'La meva activitat es pot fer a l’escola', 'La diapositiva té poc text i una imatge', 'El nostre pla inclou tothom'],
          safe: ['I did my part on time', 'My activity is realistic for school', 'My slide has short text and an image', 'Our plan includes everyone'],
          daring: ['I did my part on time', 'My activity is realistic for school', 'My slide has short text and an image', 'Our plan includes everyone and avoids stereotypes']
        } },
      { id: 'part', type: 'step', tab: { ca: 'Pas 3 · La meva part', en: 'Step 3 · My part' }, title: { ca: 'La meva part del vídeo (assaig)', en: 'My part of the video (rehearsal)' },
        intro: { ca: 'Després del primer assaig, escriu les notes clau de la teva part (no un text per llegir). Durada: 30–45 segons.', en: 'After the first rehearsal, write the key notes for your part (not a script to read). Time: Safe 45–60 seconds · Daring 60–90 seconds.' },
        fields: [
          { id: 'which', label: { ca: 'Quina part presento?', en: 'Which part do I present?' }, rows: 1 },
          { id: 'notes', label: { ca: 'Les meves notes clau', en: 'My key notes' }, rows: 5 }
        ],
        rate: {
          insecure: ['Dic tot el contingut de la meva part', 'Ho puc dir sense llegir', 'Faig servir "It is celebrated…" i el Present Simple', 'Dura 30–45 segons'],
          safe: ['I cover all the content of my part', 'I can say it without reading', 'I use the LS grammar (passive, used to, future forms)', 'It lasts 45–60 seconds'],
          daring: ['I cover all the content of my part, with reasons', 'I can say it without reading', 'I use the LS grammar accurately (passive, used to, future forms, relative clauses)', 'It lasts 60–90 seconds']
        } },
      { id: 'video', type: 'checklist', tab: { ca: 'Vídeo', en: 'Video' }, title: { ca: 'Revisa el vídeo abans d’entregar', en: 'Check your video before you submit' },
        items: {
          insecure: ['Dura 2–3 minuts', 'Tots els membres del grup parlen', 'Es veu la cara de cada persona i les diapositives alhora (picture-in-picture)', 'Expliquem què és, quan i on, tres costums i un menjar o símbol', 'Expliquem tres activitats per al dia, amb l’hora i qui fa cada una', 'Diem una idea perquè tothom s’hi senti benvingut', 'Les dades surten de dues fonts i les citem a l’última diapositiva', 'Es sent bé la veu'],
          safe: ['2–3 minutes', 'Every member speaks', 'Faces and slides visible together (picture-in-picture)', 'We compare our celebration with a local one: similarities and differences', 'We explain the origin briefly', 'Timetable, roles and materials', 'At least one decision that makes the event inclusive', 'Two sources credited on the last slide', 'Clear voice'],
          daring: ['2–3 minutes', 'Every member speaks', 'Faces and slides visible together (picture-in-picture)', 'Origin, meaning and change over time', 'Timetable, roles, materials and an estimated cost', 'Every choice is justified so the event is inclusive', 'No stereotypes or caricature costumes', 'Sources credited on the last slide', 'Clear voice']
        } },
      { id: 'email', type: 'step', tab: { ca: 'Pas 4 · El meu correu', en: 'Step 4 · My email' }, title: { ca: 'El meu correu formal', en: 'My formal email' },
        intro: { ca: 'El correu l’entregues al Classroom. Aquí només t’autoavalues abans d’entregar-lo.', en: 'You submit the email on Classroom. Here you only assess it before you submit it.' },
        rate: {
          insecure: ['Salutació i comiat formals (Dear… / Yours sincerely)', 'Primera frase: per què escric', 'Data, lloc i activitats', 'Almenys una petició', 'Sense contraccions ni paraules informals'],
          safe: ['Formal greeting and ending', 'Paragraphs: purpose, plan, request, closing', 'At least one polite request (Could we…? / Would it be possible…?)', 'No contractions or informal words'],
          daring: ['Formal greeting and ending', 'Paragraphs: purpose, plan, request, closing', 'One concern from the head teacher answered', 'Formal register (I would be grateful if…)', 'No contractions or informal words']
        } },
      { id: 'feedback', type: 'step', tab: { ca: 'Feedback a un altre grup', en: 'Feedback for another group' }, title: { ca: 'Feedback a un altre grup (no puntua)', en: 'Feedback for another group (not marked)' },
        intro: { ca: 'Mira l’esborrany del vídeo d’un altre grup i ajuda’ls a millorar-lo.', en: 'Watch another group’s draft video and help them improve it.' },
        fields: [
          { id: 'group', label: { ca: 'Quin grup? (celebració o noms)', en: 'Which group? (celebration or names)' }, rows: 1 },
          { id: 'good', label: { ca: 'Dues coses que funcionen', en: 'Two things that work' }, rows: 3 },
          { id: 'better', label: { ca: 'Una cosa per millorar', en: 'One thing to improve' }, rows: 2 }
        ],
        rate: {
          insecure: ['Tothom parla i es veuen les cares i les diapositives', 'Les dades surten de dues fonts citades', 'Expliquen la celebració amb respecte', 'El pla del dia és clar'],
          safe: ['Everyone speaks; faces and slides are visible', 'Two sources are credited', 'The celebration is presented with respect', 'The plan of the day is clear'],
          daring: ['Everyone speaks; faces and slides are visible', 'Two sources are credited', 'The celebration is presented with respect', 'The plan of the day is clear']
        } },
      { id: 'submit', type: 'checklist', tab: { ca: 'Entrega', en: 'Submit' }, title: { ca: 'Entrega al Classroom', en: 'Submit on Classroom' },
        intro: { ca: 'El producte final s’entrega al Google Classroom i el puntua el professor.', en: 'The final product is submitted on Google Classroom and marked by your teacher.' },
        items: {
          insecure: ['He pujat el vídeo del grup (o l’enllaç) al Classroom', 'He pujat el meu correu individual al Classroom'],
          safe: ['I have uploaded the group video (or its link) to Classroom', 'I have uploaded my individual email to Classroom'],
          daring: ['I have uploaded the group video (or its link) to Classroom', 'I have uploaded my individual email to Classroom']
        } },
      { id: 'team', type: 'step', tab: { ca: 'Pas 5 · Treball en equip', en: 'Step 5 · Teamwork' }, title: { ca: 'Treball en equip: reflexió i valoració dels companys', en: 'Teamwork: reflection and rating your teammates' },
        intro: { ca: 'Després d’entregar. Només el professor veu les teves respostes.', en: 'After you submit. Only your teacher sees your answers.' },
        fields: [
          { id: 'did', label: { ca: 'Què he aportat jo al grup?', en: 'What did I contribute to the group?' }, rows: 3 },
          { id: 'again', label: { ca: 'Què faria diferent la pròxima vegada?', en: 'What would I do differently next time?' }, rows: 2 }
        ],
        rate: {
          insecure: ['He fet la meva part de la feina', 'He escoltat i he ajudat el grup a decidir', 'He ajudat a millorar les diapositives i el vídeo'],
          safe: ['I did my share of the work', 'I listened and helped the group decide', 'I helped to improve the slides and the video'],
          daring: ['I did my share of the work', 'I listened and helped the group decide', 'I helped to improve the slides and the video']
        },
        peers: true, minPeers: 2,
        peersIntro: { ca: 'Puntua cada company de grup. És anònim: només ho veu el professor.', en: 'Rate each teammate. It is anonymous: only your teacher sees it.' },
        peerRate: {
          insecure: ['Ha fet la seva part a temps', 'Ha escoltat i ha ajudat a decidir', 'Ha ajudat a millorar les diapositives i el vídeo'],
          safe: ['Did their part on time', 'Listened and helped the group decide', 'Helped to improve the slides and the video'],
          daring: ['Did their part on time', 'Listened and helped the group decide', 'Helped to improve the slides and the video']
        } }
    ]
  };
})();
