/* Route-specific support changes wording only; activity scoring stays in each page. */
var learningSupport = {
  apply(level) {
    document.querySelectorAll('[data-support-ca]').forEach(node => {
      const value = node.getAttribute((level === 'insecure' || level === 'beginners') ? 'data-support-ca' : 'data-support-en');
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
    if (correct) return (level === 'insecure' || level === 'beginners') ? 'Correcte!' : 'Correct!';
    return (level === 'insecure' || level === 'beginners') ? 'Encara no. ' + catalanReason : 'Try again. ' + englishReason;
  },
  // Wrong answers never repeat the correct option: they only point back to the clue.
  evidence(level, correct, selected, answer, hint, listening) {
    if (!selected) return (level === 'insecure' || level === 'beginners') ? 'Tria una resposta abans de comprovar.' : 'Choose an answer before checking.';
    return this.feedback(level, correct,
      hint || (listening ? 'Escolta l’àudio una altra vegada i fixa’t en el detall exacte que demana la pregunta.' : 'Torna a llegir el text, busca la frase que respon la pregunta i compara-la amb cada opció.'),
      listening ? 'Listen again and focus on the exact detail the question asks about, then compare it with each option.'
        : 'Re-read the text, find the sentence that answers the question and compare it with each option.');
  },
  // attempt and model are arrays of words/chunks; the model sentence is never shown.
  order(level, correct, attempt, model) {
    const ca = (level === 'insecure' || level === 'beginners');
    let reason;
    if (attempt.length < model.length) {
      reason = ca ? 'Encara no has fet servir totes les paraules.' : 'You have not used all the words yet.';
    } else {
      let ok = 0;
      while (ok < model.length && attempt[ok] === model[ok]) ok++;
      reason = ok === 0
        ? (ca ? 'La primera paraula no és la correcta: comença per qui fa l’acció.' : 'The first word is not right: start with who does the action.')
        : (ca ? 'Les ' + ok + ' primeres paraules són al seu lloc; revisa a partir de la paraula ' + (ok + 1) + '.'
              : 'The first ' + ok + ' word' + (ok > 1 ? 's are' : ' is') + ' in the right place; check from word ' + (ok + 1) + ' onwards.');
    }
    return this.feedback(level, correct, reason + ' Recorda: qui + verb + detalls.', reason + ' Remember: subject → verb → details.');
  },
  missing(level, boxes) {
    const labels = boxes.filter(box => !box.checked).map(box => box.closest('label').textContent.trim());
    return ((level === 'insecure' || level === 'beginners') ? 'Encara falta revisar: ' : 'Still to review: ') + labels.join(' · ') +
      ((level === 'insecure' || level === 'beginners') ? '. Revisa la presentació o el vídeo i marca cada punt només quan l’hagis comprovat.' : '. Check your presentation or video before ticking each point.');
  },
  aiLanguage(level) {
    return (level === 'insecure' || level === 'beginners')
      ? 'Dona les instruccions, els títols i el feedback en català fàcil. Explica cada correcció amb una raó curta i un exemple en anglès. Mantén el text corregit en anglès.'
      : level === 'safe'
        ? 'Give headings and feedback in clear, simple English. Add a short Catalan clarification only for an essential difficult point. Keep examples and corrected production in English.'
        : 'Give all headings and feedback in English. Ask the learner to notice and revise key errors independently, with concise reasons. Keep corrected production in English.';
  }
};

// Every learning-path page loads this file, so it also brings in the microphone helper (shared/js/el-mic.js: level meter,
// mic choice, clear messages when the mic or the automatic transcript fails) and the writing log of the marking sheets
// (shared/js/el-typing.js: characters pasted, keys typed, time writing).
(function () {
  var s = document.currentScript;
  if (!s || !s.src) return;
  [['el-mic.js', window.elMic], ['el-typing.js', window.elTyping]].forEach(function (x) {
    if (x[1]) return;
    var e = document.createElement('script');
    e.src = s.src.replace(/learning-path-support\.js/, x[0]);
    document.head.appendChild(e);
  });
})();
