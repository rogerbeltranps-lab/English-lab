/* 2 ESO · LS2 Free Time, Live! · Reflect (after the final product; not graded). Tab 1 is the self-assessment (shared/js/el-self.js, Roger 2 Nov 2026). Shows the student's first-attempt checkpoint scores saved on this device. */
(function () {
  const scores = level => {
    const ca = level === 'insecure' || level === 'beginners';
    const rows = [1, 2, 3, 4].map(n => {
      let s = {}; try { s = JSON.parse(localStorage.getItem('ls2Checkpoint' + n + '2ESO') || '{}'); } catch (e) {}
      const f = (s.first || {})[level];
      return '<tr><td>Checkpoint ' + n + '</td><td>' + (f ? f.score + ' / ' + f.max : '–') + '</td></tr>';
    }).join('');
    return '<p>' + (ca ? 'El teu primer intent de cada checkpoint (en aquest dispositiu):' : 'Your first attempt at each checkpoint (on this device):') + '</p><table style="border-collapse:collapse;min-width:240px"><tbody>' + rows + '</tbody></table>';
  };
  window.LP = {
    key: 'ls2Reflect2ESO', n: 'R', title: 'Reflect',
    panels: [
      { id: 'self', type: 'self', tab: { ca: 'Autoavaluació', en: 'Self-assessment' }, title: { ca: 'Què sé fer ara?', en: 'What can I do now?' },
        intro: { ca: 'Mira enrere tota la LS: el que has après als Learning Paths i al teu vlog.', en: 'Look back at the whole LS: what you learnt in the Learning Paths and in your vlog.' },
        next: { ca: 'la LS3', en: 'LS3' },
        // Self-assessment (Roger, 2 Nov 2026; shared/js/el-self.js): two statements for each communicative competence (CE2–CE5),
        // then the other competences this LS assesses (6.2, CD4 4.5, CD2 2.2) and how I learn (CE9 9.3). lp: the tab that worked it.
        groups: [
          { k: '2', c: '2.2', icon: '🎧', n: { ca: 'Escoltar', en: 'Listening' }, items: [
            { ca: 'Entenc què fan ara i què fan normalment la Mei i el Noah als seus vídeos.', en: 'I can understand what Mei and Noah are doing now and what they usually do in their videos.', lp: ['now-or-usually.html', 'listen'] },
            { ca: 'Entenc els consells principals d’un programa de ràdio curt (Screen smart).', en: 'I can understand the main tips in a short radio programme (Screen smart).', lp: ['likes-and-screen-tips.html', 'listen'] }] },
          { k: '3', c: '3.2', icon: '🗣', n: { ca: 'Parlar', en: 'Speaking' }, items: [
            { ca: 'Sé dir què està fent la gent ara mateix i què faig jo normalment en el meu temps lliure.', en: 'I can say what people are doing right now and what I usually do in my free time.', lp: ['what-are-they-doing.html', 'talk'] },
            { ca: 'Sé gravar el meu vlog parlant clar i sense llegir cada paraula.', en: 'I can record my vlog speaking clearly, without reading every word.', lp: ['write-your-vlog-script.html', 'speak'] }] },
          { k: '4', c: '4.1 · 4.2', icon: '📖', n: { ca: 'Llegir', en: 'Reading' }, items: [
            { ca: 'Entenc posts i pàgines web sobre aficions i esdeveniments: qui, què, on i quan.', en: 'I can understand posts and web pages about hobbies and events: who, what, where and when.', lp: ['what-are-they-doing.html', 'read'] },
            { ca: 'Sé comprovar si una pàgina web és fiable: qui l’ha escrita, quan i per a què.', en: 'I can check if a web page is reliable: who wrote it, when and why.', lp: ['check-the-source.html', 'read'] }] },
          { k: '5', c: '5.1', icon: '✍️', n: { ca: 'Escriure', en: 'Writing' }, items: [
            { ca: 'Sé escriure què faig normalment i què estic fent avui (Present Simple i Present Continuous).', en: 'I can write what I usually do and what I am doing today (Present Simple and Present Continuous).', lp: ['now-or-usually.html', 'write'] },
            { ca: 'Sé escriure el guió del meu vlog en set parts, amb expressions de temps, gustos i consells.', en: 'I can write my vlog script in seven parts, with time expressions, likes and tips.', lp: ['write-your-vlog-script.html', 'write'] }] },
          { k: '6', c: '6.2', icon: '🔎', n: { ca: 'Fonts i crèdits', en: 'Sources and credits' }, items: [
            { ca: 'Sé dir d’on surt cada foto i cada dada que faig servir (títol, web, any).', en: 'I can credit every photo and fact I use (title, website, year).', lp: ['check-the-source.html', 'credit'] }] },
          { k: 'CD4', c: 'CD4 4.5 · CD2 2.2', icon: '📱', n: { ca: 'Pantalles i vídeo', en: 'Screens and video' }, items: [
            { ca: 'Sé donar consells per fer un ús saludable de les pantalles, i en segueixo almenys un.', en: 'I can give tips for a healthy use of screens, and I follow at least one.', lp: ['likes-and-screen-tips.html', 'write'] },
            { ca: 'Sé planificar, gravar i editar un vídeo curt amb diapositives.', en: 'I can plan, record and edit a short video with slides.', lp: ['free-time-vlog.html', 'edit'] }] },
          { k: '9', c: '9.3', icon: '🧠', n: { ca: 'Com aprenc', en: 'How I learn' }, items: [
            { ca: 'Faig cada activitat sol/a i sense apunts el primer cop.', en: 'I do each activity on my own and without notes the first time.' },
            { ca: 'Llegeixo les correccions del professor i les faig servir per millorar el text següent.', en: 'I read my teacher’s corrections and use them to improve my next text.' }] }
        ] },
      { id: 'scores', type: 'info', tab: { ca: 'Els meus checkpoints', en: 'My checkpoints' }, title: { ca: 'Com ha anat la memòria?', en: 'How did your memory do?' }, html: scores },
      { id: 'reflect', type: 'form', tab: { ca: 'Reflexió', en: 'Reflection' }, title: { ca: 'Reflexiona', en: 'Reflect' },
        intro: { ca: 'Respon amb sinceritat: això no puntua.', en: 'Answer honestly: this is not marked.' },
        fields: [
          { id: 'improve', label: { ca: 'Mirant els teus checkpoints, què has millorat més?', en: 'Looking at your checkpoints, what improved most?' } },
          { id: 'helped', label: { ca: 'Què t’ha ajudat més: els recalls sense apunts, les targetes, la pràctica barrejada, el feedback amb IA o el teu company de vlog? Per què?', en: 'What helped you most: recall quizzes, flashcards, mixed practice, AI feedback or your vlog buddy? Why?' } },
          { id: 'tip', label: { ca: 'Quin consell de pantalla has aplicat aquestes setmanes? Com ha anat?', en: 'Which screen tip did you apply these weeks? How did it go?' } },
          { id: 'goal', label: { ca: 'Un objectiu per a la LS3', en: 'One goal for LS3' } }
        ],
        checklist: { insecure: ['He respost les quatre preguntes'], safe: ['I have answered the four questions'], daring: ['I have answered the four questions'] } }
    ]
  };
})();
