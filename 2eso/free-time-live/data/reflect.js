/* 2 ESO · LS2 Free Time, Live! · Reflect (after the final product; not graded). Shows the student's first-attempt checkpoint scores saved on this device. */
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
      { id: 'scores', type: 'info', tab: { ca: 'Els meus checkpoints', en: 'My checkpoints' }, title: { ca: 'Com ha anat la memòria?', en: 'How did your memory do?' }, html: scores },
      { id: 'reflect', type: 'form', tab: { ca: 'Reflexió', en: 'Reflection' }, title: { ca: 'Reflexiona', en: 'Reflect' },
        intro: { ca: 'Respon amb sinceritat: això no puntua.', en: 'Answer honestly: this is not marked.' },
        fields: [
          { id: 'can', label: { ca: 'Puntua’t de l’1 al 4 en cada objectiu: entendre posts i vlogs sobre aficions · saber si una pàgina és fiable · explicar què està passant ara i què faig normalment · escriure i gravar el meu vlog · donar consells de pantalla.', en: 'Rate yourself 1–4 on each objective: understand posts and vlogs about hobbies · know if a page is reliable · say what is happening now and what I usually do · write and record my vlog · give screen-use tips.' } },
          { id: 'improve', label: { ca: 'Mirant els teus checkpoints, què has millorat més?', en: 'Looking at your checkpoints, what improved most?' } },
          { id: 'helped', label: { ca: 'Què t’ha ajudat més: els recalls sense apunts, les targetes, la pràctica barrejada, el feedback amb IA o el teu company de vlog? Per què?', en: 'What helped you most: recall quizzes, flashcards, mixed practice, AI feedback or your vlog buddy? Why?' } },
          { id: 'tip', label: { ca: 'Quin consell de pantalla has aplicat aquestes setmanes? Com ha anat?', en: 'Which screen tip did you apply these weeks? How did it go?' } },
          { id: 'goal', label: { ca: 'Un objectiu per a la LS3', en: 'One goal for LS3' } }
        ],
        checklist: { insecure: ['He respost les cinc preguntes'], safe: ['I have answered the five questions'], daring: ['I have answered the five questions'] } }
    ]
  };
})();
