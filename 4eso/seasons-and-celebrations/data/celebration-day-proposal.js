/* LS2 · Final product: Celebration Day Proposal (from the LS2 programme). The video goes to Google Classroom; the email is pasted in step 4,
   so it is in the teacher's marking PDF. Marked by the teacher in two rounds (docs/4eso/ls2-seasons-and-celebrations/final-product-assessment.md). */
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
          ca: '<p>En grups de 3–4, dissenyeu un dia de celebració respectuós a l’escola al voltant d’una tradició. Entregueu:</p><ul><li>un <strong>vídeo de grup de 2–3 minuts amb Google Slides</strong>: <strong>tots els membres parlen</strong> i es veu la cara de cadascú i les diapositives alhora (picture-in-picture), amb veu clara;</li><li>un <strong>correu formal individual</strong> a la direcció proposant l’acte.</li></ul><p><strong>Procés:</strong> tria una celebració → recerca (2+ fonts) → notes → planifica l’acte → Google Slides → grava el pitch del grup → escriu el correu formal → revisa → entrega.</p><p><strong>Insecure:</strong> descriu una celebració amb frases curtes: què, quan, on, tres costums, un menjar o símbol, què significa per a la gent que la celebra i una cosa que té en comú amb una celebració local. Planifica tres activitats per al dia: per a cada una, a quina hora és i qui la fa. Digueu un estereotip sobre la gent que la celebra, per què és injust i com l’evita el vostre pla. Correu: plantilla guiada amb buits, amb dues accions perquè tots els alumnes i les famílies s’hi sentin benvinguts.</p><p>Cadena d’exemple: <em>font</em> “Diwali is celebrated in October or November” → <em>notes</em> “Diwali · Oct/Nov · lights” → <em>diapositiva</em> “Diwali · October or November · festival of lights” → <em>frase oral</em> “Diwali is celebrated in October or November.” → <em>correu</em> “We would like to organise a Diwali day in November.”</p><p>Els significats religiosos es presenten com a informació, no com a creença. Vosaltres trieu quina tradició presenteu.</p><p><strong>Com treballeu:</strong> en grup amb companys de la teva mateixa ruta (el professor fa els grups). Cada membre presenta una part del vídeo (40–60 segons): (1) què, quan i on, què significa per a la gent que la celebra i per què ha de tenir un lloc a l’escola · (2) tres costums, un menjar o símbol i una cosa en comú amb una celebració local · (3) el nostre dia: tres activitats amb l’hora i qui les fa, una decisió perquè sigui per a tothom i un estereotip que evitem (per què és injust i com l’evitem). A cada pas, entregues aquí una tasca individual, t’autoavalues i pots deixar un comentari al professor.</p><h3>El que es demana a la ruta Insecure</h3><ul><li>font → notes → diapositiva → frase oral → frase del correu, amb exemples en anglès</li><li>Present Simple i <em>It is celebrated on… / It takes place in…</em></li><li>dues fonts citades a l’última diapositiva</li><li>tots parlen i es veuen la cara i les diapositives</li><li>correu amb la plantilla guiada (Dear… / I am writing to… / We would like to… / Yours sincerely)</li></ul><h3>Què compta a l’avaluació final?</h3><p>Nota de la LS: examen final 35 % · producte final 25 % · activitats de gramàtica i vocabulari 20 % · altres competències 20 %.</p><ul><li><strong>La meva part del vídeo de grup · 40 %:</strong> planificada, assajada i gravada junts; expliques la teva part amb un guió revisat per a un públic que no coneix la celebració; es veuen les cares i les diapositives · CE3.2</li><li><strong>Correu formal individual · 35 %:</strong> propòsit, pla i petició; format, registre i correcció; la tasca de la teva ruta · CE5.1</li><li><strong>La meva font · 15 %:</strong> la font que investigues al pas 1, valorada com a fiable o no amb dues raons · CE4.2</li><li><strong>Treball en equip i procés · 10 %:</strong> la valoració dels teus companys i els passos que entregues en aquesta pàgina · CE3.2</li><li><strong>Altres competències:</strong> fitxa de recerca amb les referències completes (CE6.1); significat i lloc a l’escola (CE1.1); relació amb una celebració local i inclusió (CE1.2); un estereotip identificat i evitat (CC3 3.2); dues accions de benvinguda al correu (CC1 1.3)</li></ul><p>A la pestanya <strong>Rúbrica</strong> tens el detall de cada fila.</p>',
          en: '<p>In groups of 3–4, design a respectful celebration day at school around one tradition. Submit:</p><ul><li>a <strong>2–3 minute group video with Google Slides</strong>, <strong>every member speaking</strong> with their <strong>face visible in picture-in-picture</strong> together with the slides, and a clear voice;</li><li>an <strong>individual formal email</strong> to the head teacher proposing the event.</li></ul><p><strong>Process:</strong> choose a celebration → research (3 sources) → notes → plan the event → Google Slides → record the group pitch → write the formal email → review → submit.</p><p><strong>Safe:</strong> describe the celebration, say what it means for the people who celebrate it and <strong>compare it with a local one</strong>: similarities and differences. Explain its origin briefly. Plan the day with a timetable, roles and materials. Explain at least one decision that makes the event inclusive. Name one stereotype about the people who celebrate it, explain why it is unfair and show how your plan avoids it. Email: a full formal email in paragraphs, with two concrete actions so every student and family feels welcome.</p><p><strong>Daring:</strong> explain the origin, meaning and how the tradition has changed over time. Plan the day with a timetable, roles, materials and an estimated cost. Justify every choice so the event is inclusive and avoids stereotypes or caricature costumes. Name one stereotype, explain why it is unfair with evidence from your research and show how your choices challenge it. In the email, include two welcome actions with reasons, and anticipate one concern from the head teacher and answer it.</p><p>Present religious meanings as information, not as belief. You choose which tradition you present.</p><p><strong>How you work:</strong> in a group with classmates of your own route (your teacher makes the groups). Each member presents one part of the video (35–45 seconds; the whole video lasts 2–3 minutes). <strong>Safe:</strong> (1) the celebration, its origin, what it means for the people who celebrate it and why it belongs at school · (2) here and there: comparison with a local celebration · (3) our day: activities and timetable · (4) roles, materials, one inclusive decision and one stereotype we avoid (why it is unfair and how). <strong>Daring:</strong> (1) origin, what it means for the people who celebrate it and why it belongs at school · (2) change over time and comparison with a local celebration · (3) our day: activities, timetable and roles · (4) materials, cost, why every choice is inclusive and one stereotype our plan challenges. In a group of 3, part 4 is shared. At each step you hand in an individual task here, assess yourself and can leave a comment for your teacher.</p><h3>What your route asks for</h3><p><strong>Safe:</strong></p><ul><li>similarities and differences</li><li>three sources, each rated with two reasons</li><li>Past Simple and used to for the origin</li><li>future forms for the plan</li><li>polite formal requests</li></ul><p><strong>Daring:</strong></p><ul><li>developed explanation of change over time</li><li>justified, inclusive choices that challenge a stereotype</li><li>three sources, compared and evaluated</li><li>formal register (I would be grateful if…)</li><li>concession and contrast: although, on the other hand</li></ul><h3>What counts in the final assessment?</h3><p>LS mark: final exam 35 % · final product 25 % · grammar and vocabulary activities 20 % · other competences 20 %.</p><ul><li><strong>My part of the group video · 40 %:</strong> planned, rehearsed and recorded together; each member explains their part from a script revised for an audience that does not know the celebration; faces and slides visible · CE3.2</li><li><strong>Individual formal email · 35 %:</strong> purpose, plan and request; format, register and accuracy; your route’s task · CE5.1</li><li><strong>My source · 15 %:</strong> the source you research in step 1, rated reliable or not with two reasons · CE4.2</li><li><strong>Teamwork &amp; process · 10 %:</strong> your teammates’ ratings and the steps you hand in on this page · CE3.2</li><li><strong>Other competences:</strong> research sheet with full references (CE6.1); meaning and place at school (CE1.1); local link and inclusion (CE1.2); a stereotype named and avoided (CC3 3.2); two welcome actions in your email (CC1 1.3)</li></ul><p>The <strong>Rubric</strong> tab has the detail of every row.</p>'
        } },
      { id: 'rubric', type: 'info', tab: { ca: 'Rúbrica', en: 'Rubric' }, title: { ca: 'Com s’avalua', en: 'How it is assessed' },
        html: '<div id="rubricHost"></div>', after: level => finalRubric.render(level) },
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
        intro: { ca: 'Cada membre del grup busca una font sobre la celebració (el grup en necessita almenys dues). Enganxa aquí les teves notes i la referència, i digues si és fiable.', en: 'Each member of the group finds one source about the celebration (your group needs three in total). Paste your notes and the credit line here, and say if it is reliable.' },
        fields: [
          { id: 'credit', label: { ca: 'Referència: "Títol de la pàgina", web o autor, any', en: 'Credit line: "Title of the page", website or author, year' }, rows: 2 },
          { id: 'notes', label: { ca: '3–5 notes amb les teves paraules (no copiïs frases)', en: '3–5 notes in your own words (do not copy sentences)' }, rows: 5 },
          { id: 'why', label: { ca: 'És fiable o cal comprovar-ho? Dues raons (qui l’ha escrita, de quan és, per què, on es publica)', en: 'Reliable or not? Two reasons (author, date, purpose, website or channel)' }, rows: 2 }
        ],
        rate: {
          insecure: ['Dono dues raons per dir si la meva font és fiable', 'Les notes són amb les meves paraules', 'La referència és completa', 'Explico les creences com a informació'],
          safe: ['I give two reasons why my source is reliable or not', 'My notes are in my own words', 'My credit line is complete', 'Religious meanings are written as information'],
          daring: ['I give two precise reasons why my source is reliable or not (author, date, purpose, channel)', 'My notes are in my own words', 'My credit line is complete', 'Religious meanings are written as information']
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
        intro: { ca: 'Escriu el guió de la teva part i assaja’l amb el grup. Després millora’l perquè l’entengui algú que no coneix la celebració, i fes-te les notes clau per gravar (a la gravació no llegeixis el guió). Durada: 40–60 segons.', en: 'Write the script for your part and rehearse it with your group. Then revise it so that someone who does not know the celebration can follow it, and make key notes for the recording (do not read the script on camera). Time: 35–45 seconds.' },
        fields: [
          { id: 'which', label: { ca: 'Quina part presento?', en: 'Which part do I present?' }, rows: 1 },
          { id: 'script', label: { ca: 'El meu guió (després de l’assaig)', en: 'My script (after the rehearsal)' }, rows: 6 },
          { id: 'changed', label: { ca: 'Què he canviat després de l’assaig perquè el públic ho entengui? (per exemple: he explicat una paraula, he afegit un exemple)', en: 'What did I change after the rehearsal so the audience can follow? (e.g. I explained a word, added an example, linked to the next speaker)' }, rows: 2 },
          { id: 'notes', label: { ca: 'Les meves notes clau per gravar', en: 'My key notes for the recording' }, rows: 4 }
        ],
        rate: {
          insecure: ['Dic tot el contingut de la meva part', 'He millorat el guió després de l’assaig', 'Ho puc dir sense llegir', 'Faig servir "It is celebrated…" i el Present Simple', 'Dura 40–60 segons'],
          safe: ['I cover all the content of my part', 'I revised my script after the rehearsal so the audience can follow', 'I can say it without reading', 'I use the LS grammar (passive, used to, future forms)', 'It lasts 35–45 seconds'],
          daring: ['I cover all the content of my part, with reasons', 'I revised my script for an audience that does not know the celebration', 'I can say it without reading', 'I use the LS grammar accurately (passive, used to, future forms, relative clauses)', 'It lasts 35–45 seconds']
        } },
      { id: 'video', type: 'checklist', tab: { ca: 'Vídeo', en: 'Video' }, title: { ca: 'Revisa el vídeo abans d’entregar', en: 'Check your video before you submit' },
        items: {
          insecure: ['Dura 2–3 minuts', 'Tots els membres del grup parlen', 'Es veu la cara de cada persona i les diapositives alhora (picture-in-picture)', 'Expliquem què és, quan i on, tres costums i un menjar o símbol', 'Diem què significa per a la gent que la celebra i per què ha de tenir un lloc a l’escola', 'Diem una cosa que té en comú amb una celebració local', 'Expliquem tres activitats per al dia, amb l’hora i qui fa cada una', 'Diem una decisió perquè el dia sigui per a tothom', 'Anomenem un estereotip, diem per què és injust i com l’evitem', 'Les dades surten de dues fonts i les citem a l’última diapositiva', 'Es sent bé la veu'],
          safe: ['2–3 minutes', 'Every member speaks', 'Faces and slides visible together (picture-in-picture)', 'What it means for the people who celebrate it and why it belongs at school', 'We compare our celebration with a local one: similarities and differences', 'We explain the origin briefly', 'Timetable, roles and materials', 'At least one decision that makes the event inclusive', 'One stereotype: why it is unfair and how our plan avoids it', 'Three sources credited on the last slide', 'Clear voice'],
          daring: ['2–3 minutes', 'Every member speaks', 'Faces and slides visible together (picture-in-picture)', 'Origin, meaning and change over time', 'Why it belongs at school (respect for cultural diversity)', 'Comparison with a local celebration', 'Timetable, roles, materials and an estimated cost', 'Every choice is justified so the event is inclusive', 'One stereotype: why it is unfair and how our choices challenge it; no caricature costumes', 'Three sources credited on the last slide', 'Clear voice']
        } },
      { id: 'email', type: 'step', tab: { ca: 'Pas 4 · El meu correu', en: 'Step 4 · My email' }, title: { ca: 'El meu correu formal', en: 'My formal email' },
        intro: { ca: 'Enganxa aquí la versió final del teu correu: el professor el corregeix des d’aquí. Abans d’entregar-lo, autoavalua’l.', en: 'Paste the final version of your email here: your teacher marks it from here. Before you hand it in, assess it.' },
        fields: [
          { id: 'email', label: { ca: 'El meu correu a la direcció (versió final)', en: 'My email to the head teacher (final version)' }, rows: 14 }
        ],
        rate: {
          insecure: ['Salutació i comiat formals (Dear… / Yours sincerely)', 'Primera frase: per què escric', 'Data, lloc i activitats', 'Dues accions perquè tothom s’hi senti benvingut', 'Almenys una petició', 'Sense contraccions ni paraules informals'],
          safe: ['Formal greeting and ending', 'Paragraphs: purpose, plan, request, closing', 'Two concrete actions so every student and family feels welcome', 'At least one polite request (Could we…? / Would it be possible…?)', 'No contractions or informal words'],
          daring: ['Formal greeting and ending', 'Paragraphs: purpose, plan, request, closing', 'Two concrete welcome actions, with reasons', 'One concern from the head teacher answered', 'Formal register (I would be grateful if…)', 'No contractions or informal words']
        } },
      { id: 'feedback', type: 'step', tab: { ca: 'Feedback a un altre grup', en: 'Feedback for another group' }, title: { ca: 'Feedback a un altre grup (no puntua)', en: 'Feedback for another group (not marked)' },
        intro: { ca: 'Mira l’esborrany del vídeo d’un altre grup i ajuda’ls a millorar-lo.', en: 'Watch another group’s draft video and help them improve it.' },
        fields: [
          { id: 'group', label: { ca: 'Quin grup? (celebració o noms)', en: 'Which group? (celebration or names)' }, rows: 1 },
          { id: 'good', label: { ca: 'Dues coses que funcionen', en: 'Two things that work' }, rows: 3 },
          { id: 'better', label: { ca: 'Una cosa per millorar', en: 'One thing to improve' }, rows: 2 }
        ],
        rate: {
          insecure: ['Tothom parla i es veuen les cares i les diapositives', 'Les dades surten de dues fonts citades', 'Expliquen la celebració amb respecte', 'Diuen un estereotip i com l’eviten', 'El pla del dia és clar'],
          safe: ['Everyone speaks; faces and slides are visible', 'Three sources are credited', 'The celebration is presented with respect', 'They name a stereotype and show how they avoid it', 'The plan of the day is clear'],
          daring: ['Everyone speaks; faces and slides are visible', 'Three sources are credited', 'The celebration is presented with respect', 'They name a stereotype and show how they avoid it', 'The plan of the day is clear']
        } },
      { id: 'submit', type: 'checklist', tab: { ca: 'Entrega', en: 'Submit' }, title: { ca: 'Entrega el producte final', en: 'Submit the final product' },
        intro: { ca: 'El vídeo s’entrega al Google Classroom i el correu, al pas 4 d’aquesta pàgina. El professor ho puntua.', en: 'The video goes to Google Classroom and the email to step 4 on this page. Your teacher marks them.' },
        items: {
          insecure: ['He pujat el vídeo del grup (o l’enllaç) al Classroom', 'He enganxat el meu correu final al pas 4'],
          safe: ['I have uploaded the group video (or its link) to Classroom', 'I have pasted my final email in step 4'],
          daring: ['I have uploaded the group video (or its link) to Classroom', 'I have pasted my final email in step 4']
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
