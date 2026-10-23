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
          ca: '<p>En grups de 3–4, dissenyeu un dia de celebració respectuós a l’escola al voltant d’una tradició. Entregueu:</p><ul><li>un <strong>vídeo de grup de 2–3 minuts amb Google Slides</strong>: <strong>tots els membres parlen</strong> i es veu la cara de cadascú i les diapositives alhora (picture-in-picture), amb veu clara;</li><li>un <strong>correu formal individual</strong> a la direcció proposant l’acte.</li></ul><p><strong>Procés:</strong> tria una celebració → recerca (2+ fonts) → notes → planifica l’acte → Google Slides → grava el pitch del grup → escriu el correu formal → revisa → entrega.</p><p><strong>Insecure:</strong> descriu una celebració amb frases curtes: què, quan, on, tres costums, un menjar o símbol. Planifica tres activitats per al dia. Correu: plantilla guiada amb buits.</p><p>Cadena d’exemple: <em>font</em> “Diwali is celebrated in October or November” → <em>notes</em> “Diwali · Oct/Nov · lights” → <em>diapositiva</em> “Diwali · October or November · festival of lights” → <em>frase oral</em> “Diwali is celebrated in October or November.” → <em>correu</em> “We would like to organise a Diwali day in November.”</p><p>Els significats religiosos es presenten com a informació, no com a creença. Vosaltres trieu quina tradició presenteu.</p>',
          en: '<p>In groups of 3–4, design a respectful celebration day at school around one tradition. Submit:</p><ul><li>a <strong>2–3 minute group video with Google Slides</strong>, <strong>every member speaking</strong> with their <strong>face visible in picture-in-picture</strong> together with the slides, and a clear voice;</li><li>an <strong>individual formal email</strong> to the head teacher proposing the event.</li></ul><p><strong>Process:</strong> choose a celebration → research (2+ sources) → notes → plan the event → Google Slides → record the group pitch → write the formal email → review → submit.</p><p><strong>Safe:</strong> describe the celebration and <strong>compare it with a local one</strong>: similarities and differences. Explain its origin briefly. Plan the day with a timetable, roles and materials. Email: a full formal email in paragraphs.</p><p><strong>Daring:</strong> explain the origin, meaning and how the tradition has changed over time. Justify every choice so the event is inclusive and avoids stereotypes or caricature costumes. Anticipate one concern from the head teacher and answer it in the email.</p><p>Present religious meanings as information, not as belief. You choose which tradition you present.</p>'
        } },
      { id: 'pieces', type: 'info', tab: { ca: 'Les meves peces', en: 'My pieces' }, title: { ca: 'Les teves peces', en: 'Your pieces' },
        intro: { ca: 'Aquí tens el que has desat a cada Learning Path en aquest dispositiu. Fes-ho servir per a les diapositives i el correu.', en: 'This is what you saved in each Learning Path on this device. Use it for your slides and your email.' },
        html: pieces },
      { id: 'video', type: 'checklist', tab: { ca: 'Vídeo', en: 'Video' }, title: { ca: 'Revisa el vídeo abans d’entregar', en: 'Check your video before you submit' },
        items: {
          insecure: ['Dura 2–3 minuts', 'Tots els membres del grup parlen', 'Es veu la cara de cada persona i les diapositives alhora (picture-in-picture)', 'Expliquem què és, quan i on, tres costums i un menjar o símbol', 'Expliquem tres activitats per al dia', 'Les dades surten de dues fonts i les citem a l’última diapositiva', 'Es sent bé la veu'],
          safe: ['2–3 minutes', 'Every member speaks', 'Faces and slides visible together (picture-in-picture)', 'We compare our celebration with a local one: similarities and differences', 'We explain the origin briefly', 'Timetable, roles and materials', 'Two sources credited on the last slide', 'Clear voice'],
          daring: ['2–3 minutes', 'Every member speaks', 'Faces and slides visible together (picture-in-picture)', 'Origin, meaning and change over time', 'Every choice is justified so the event is inclusive', 'No stereotypes or caricature costumes', 'Sources credited on the last slide', 'Clear voice']
        } },
      { id: 'email', type: 'checklist', tab: { ca: 'Correu', en: 'Email' }, title: { ca: 'Revisa el correu abans d’entregar', en: 'Check your email before you submit' },
        items: {
          insecure: ['Salutació i comiat formals (Dear… / Yours sincerely)', 'Primera frase: per què escric', 'Data, lloc i activitats', 'Almenys una petició', 'Sense contraccions ni paraules informals'],
          safe: ['Formal greeting and ending', 'Paragraphs: purpose, plan, request, closing', 'At least one polite request (Could we…? / Would it be possible…?)', 'No contractions or informal words'],
          daring: ['Formal greeting and ending', 'Paragraphs: purpose, plan, request, closing', 'One concern from the head teacher answered', 'Formal register (I would be grateful if…)', 'No contractions or informal words']
        } },
      { id: 'submit', type: 'checklist', tab: { ca: 'Entrega', en: 'Submit' }, title: { ca: 'Entrega al Classroom', en: 'Submit on Classroom' },
        intro: { ca: 'El producte final s’entrega al Google Classroom i el puntua el professor.', en: 'The final product is submitted on Google Classroom and marked by your teacher.' },
        items: {
          insecure: ['He pujat el vídeo del grup (o l’enllaç) al Classroom', 'He pujat el meu correu individual al Classroom'],
          safe: ['I have uploaded the group video (or its link) to Classroom', 'I have uploaded my individual email to Classroom'],
          daring: ['I have uploaded the group video (or its link) to Classroom', 'I have uploaded my individual email to Classroom']
        } }
    ]
  };
})();
