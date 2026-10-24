/* LS2 · Reflect (14 Dec, after the final product; not graded). Shows the student's first-attempt checkpoint scores saved on this device. */
(function () {
  const scores = level => {
    const ca = level === 'insecure';
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
      { id: 'scores', type: 'info', tab: { ca: 'Els meus checkpoints', en: 'My checkpoints' }, title: { ca: 'Com ha anat la memòria?', en: 'How did your memory do?' }, html: scores },
      { id: 'reflect', type: 'form', tab: { ca: 'Reflexió', en: 'Reflection' }, title: { ca: 'Reflexiona', en: 'Reflect' },
        intro: { ca: 'Respon amb sinceritat: això no puntua.', en: 'Answer honestly: this is not marked.' },
        fields: [
          { id: 'can', label: { ca: 'Puntua’t de l’1 al 4 en cada objectiu: entendre textos sobre celebracions · descriure costums i orígens · comparar celebracions · comprovar fonts · planificar un acte i escriure un correu formal.', en: 'Rate yourself 1–4 on each objective: understand texts about celebrations · describe customs and origins · compare celebrations · check sources · plan an event and write a formal email.' } },
          { id: 'improve', label: { ca: 'Mirant els teus checkpoints, què has millorat més?', en: 'Looking at your checkpoints, what improved most?' } },
          { id: 'helped', label: { ca: 'Què t’ha ajudat més: els recalls sense apunts, les targetes, la pràctica barrejada, el feedback amb IA o el treball en grup? Per què?', en: 'What helped you most: recall quizzes, flashcards, mixed practice, AI feedback or group work? Why?' } },
          { id: 'goal', label: { ca: 'Un objectiu per a la LS3', en: 'One goal for LS3' } }
        ],
        checklist: { insecure: ['He respost les quatre preguntes'], safe: ['I have answered the four questions'], daring: ['I have answered the four questions'] } }
    ]
  };
})();
