/* Route-specific support changes wording only; activity scoring stays in each page. */
var learningSupport = {
  apply(level) {
    document.querySelectorAll('[data-support-ca]').forEach(node => {
      const value = node.getAttribute(level === 'insecure' ? 'data-support-ca' : 'data-support-en');
      if (node.hasAttribute('data-support-placeholder')) node.setAttribute('placeholder', value);
      else node.innerHTML = value;
    });
  },
  // Random order for answer options. Question order is never changed, and option values keep their original index.
  shuffled(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  },
  shuffledIndexes(n) {
    return this.shuffled([...Array(n).keys()]);
  },
  feedback(level, correct, catalanReason, englishReason) {
    if (correct) return level === 'insecure' ? 'Correcte!' : 'Correct!';
    return level === 'insecure' ? 'Encara no. ' + catalanReason : 'Try again. ' + englishReason;
  },
  evidence(level, correct, selected, answer, hint, listening) {
    if (!selected) return level === 'insecure' ? 'Tria una resposta abans de comprovar.' : 'Choose an answer before checking.';
    return this.feedback(level, correct, hint || 'Busca la informació que justifica «' + answer + '».',
      (listening ? 'Listen' : 'Read') + ' for the evidence supporting “' + answer + '”, rather than a plausible answer from your own routine.');
  },
  order(level, correct, model) {
    return this.feedback(level, correct,
      'Comença per qui fa l’acció, després el verb i els detalls. Compara la teva frase amb el model: ' + model,
      'Check subject → verb → details against the model: ' + model);
  },
  missing(level, boxes) {
    const labels = boxes.filter(box => !box.checked).map(box => box.closest('label').textContent.trim());
    return (level === 'insecure' ? 'Encara falta revisar: ' : 'Still to review: ') + labels.join(' · ') +
      (level === 'insecure' ? '. Revisa la presentació o el vídeo i marca cada punt només quan l’hagis comprovat.' : '. Check your presentation or video before ticking each point.');
  },
  aiLanguage(level) {
    return level === 'insecure'
      ? 'Dona les instruccions, els títols i el feedback en català fàcil. Explica cada correcció amb una raó curta i un exemple en anglès. Mantén el text corregit en anglès.'
      : level === 'safe'
        ? 'Give headings and feedback in clear, simple English. Add a short Catalan clarification only for an essential difficult point. Keep examples and corrected production in English.'
        : 'Give all headings and feedback in English. Ask the learner to notice and revise key errors independently, with concise reasons. Keep corrected production in English.';
  }
};
