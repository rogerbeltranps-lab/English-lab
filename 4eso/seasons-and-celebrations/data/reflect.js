/* LS2 · Reflect (14 Dec, after the final product; not graded). Tab 1 is the self-assessment (shared/js/el-self.js, Roger 2 Nov 2026). Shows the student's first-attempt checkpoint scores saved on this device. */
(function () {
  const scores = level => {
    const ca = level === 'insecure' || level === 'beginners';
    const rows = [1, 2, 3, 4].map(n => {
      let s = {}; try { s = JSON.parse(localStorage.getItem('ls2Checkpoint' + n + '4ESO') || '{}'); } catch (e) {}
      const f = (s.first || {})[level];
      return '<tr><td>Checkpoint ' + n + '</td><td>' + (f ? f.score + ' / ' + f.max : '–') + '</td></tr>';
    }).join('');
    return '<p>' + (ca ? 'El teu primer intent de cada checkpoint (en aquest dispositiu):' : 'Your first attempt at each checkpoint (on this device):') + '</p><table style="border-collapse:collapse;min-width:240px"><tbody>' + rows + '</tbody></table>';
  };
  window.LP = {
    key: 'ls2Reflect4ESO', n: 'R', title: 'Reflect',
    panels: [
      { id: 'self', type: 'self', tab: { ca: 'Autoavaluació', en: 'Self-assessment' }, title: { ca: 'Què sé fer ara?', en: 'What can I do now?' },
        intro: { ca: 'Mira enrere tota la LS: el que has après als Learning Paths i a la proposta del grup.', en: 'Look back at the whole LS: what you learnt in the Learning Paths and in your group’s proposal.' },
        next: { ca: 'la LS3', en: 'LS3' },
        // Self-assessment (Roger, 2 Nov 2026; shared/js/el-self.js): two statements for each communicative competence (CE2–CE5),
        // then the other competences this LS assesses (1.1/1.2, 6.1, CC1 1.3) and how I learn (CE9 9.3). lp: the tab that worked it.
        groups: [
          { k: '2', c: '2.2', icon: '🎧', n: { ca: 'Escoltar', en: 'Listening' }, items: [
            { ca: 'Entenc gent que explica com celebra una festa (els vídeos de la Mei i del Noah).', en: 'I can understand people explaining how they celebrate a festival (Mei’s and Noah’s videos).', lp: ['where-traditions-come-from.html', 'listen'] },
            { ca: 'Entenc els plans d’un acte: què, quan, on i qui fa cada cosa.', en: 'I can understand plans for an event: what, when, where and who does what.', lp: ['plan-the-day.html', 'listen'] }] },
          { k: '3', c: '3.2', icon: '🗣', n: { ca: 'Parlar', en: 'Speaking' }, items: [
            { ca: 'Sé explicar els costums, les dates i l’origen d’una celebració a algú que no la coneix.', en: 'I can explain the customs, dates and origins of a celebration to someone who does not know it.', lp: ['where-traditions-come-from.html', 'talk'] },
            { ca: 'Sé presentar la meva part del vídeo del grup parlant clar i sense llegir cada paraula.', en: 'I can present my part of the group video speaking clearly, without reading every word.', lp: ['celebration-day-proposal.html', 'part'] }] },
          { k: '4', c: '4.1 · 4.2', icon: '📖', n: { ca: 'Llegir', en: 'Reading' }, items: [
            { ca: 'Entenc articles sobre celebracions: idees principals, detalls i paraules noves pel context.', en: 'I can understand articles about celebrations: main ideas, details and new words from context.', lp: ['celebrations-around-the-world.html', 'read'] },
            { ca: 'Sé dir si una font és fiable i busco cada dada en dues fonts.', en: 'I can tell whether a source is reliable, and I check each fact in two sources.', lp: ['research-it-right.html', 'sources'] }] },
          { k: '5', c: '5.1', icon: '✍️', n: { ca: 'Escriure', en: 'Writing' }, items: [
            { ca: 'Sé escriure el pla d’un acte amb formes de futur (going to, will, Present Continuous).', en: 'I can write a plan for an event with future forms (going to, will, Present Continuous).', lp: ['plan-the-day.html', 'write'] },
            { ca: 'Sé escriure un correu formal amb la salutació, el to i el comiat adequats.', en: 'I can write a formal email with the right greeting, register and closing.', lp: ['write-to-the-head-teacher.html', 'write'] }] },
          { k: '1', c: '1.1 · 1.2', icon: '🌍', n: { ca: 'Cultures', en: 'Cultures' }, items: [
            { ca: 'Sé comparar una celebració amb una de les nostres i parlar-ne amb respecte, sense estereotips.', en: 'I can compare a celebration with a local one and talk about it with respect, without stereotypes.', lp: ['research-it-right.html', 'respect'] }] },
          { k: '6', c: '6.1', icon: '🔎', n: { ca: 'Fonts', en: 'Sources' }, items: [
            { ca: 'Sé prendre apunts amb les meves paraules i citar les fonts.', en: 'I can take notes in my own words and credit my sources.', lp: ['research-it-right.html', 'notes'] }] },
          { k: 'CC1', c: 'CC1 1.3', icon: '🤝', n: { ca: 'Treball en grup', en: 'Teamwork' }, items: [
            { ca: 'Faig la meva part al grup i ajudo a posar-nos d’acord.', en: 'I do my part in the group and help us agree on decisions.', lp: ['celebration-day-proposal.html', 'contribution'] }] },
          { k: '9', c: '9.3', icon: '🧠', n: { ca: 'Com aprenc', en: 'How I learn' }, items: [
            { ca: 'Faig cada activitat sol/a i sense apunts el primer cop.', en: 'I do each activity on my own and without notes the first time.' },
            { ca: 'Llegeixo les correccions del professor i les faig servir per millorar el text següent.', en: 'I read my teacher’s corrections and use them to improve my next text.' }] }
        ] },
      { id: 'scores', type: 'info', tab: { ca: 'Els meus checkpoints', en: 'My checkpoints' }, title: { ca: 'Com ha anat la memòria?', en: 'How did your memory do?' }, html: scores },
      { id: 'reflect', type: 'form', tab: { ca: 'Reflexió', en: 'Reflection' }, title: { ca: 'Reflexiona', en: 'Reflect' },
        intro: { ca: 'Respon amb sinceritat: això no puntua.', en: 'Answer honestly: this is not marked.' },
        fields: [
          { id: 'improve', label: { ca: 'Mirant els teus checkpoints, què has millorat més?', en: 'Looking at your checkpoints, what improved most?' } },
          { id: 'helped', label: { ca: 'Què t’ha ajudat més: els recalls sense apunts, les targetes, la pràctica barrejada, el feedback amb IA o el treball en grup? Per què?', en: 'What helped you most: recall quizzes, flashcards, mixed practice, AI feedback or group work? Why?' } },
          { id: 'goal', label: { ca: 'Un objectiu per a la LS3', en: 'One goal for LS3' } }
        ],
        checklist: { insecure: ['He respost les tres preguntes'], safe: ['I have answered the three questions'], daring: ['I have answered the three questions'] } }
    ]
  };
})();
