/* Flashcard practice with a small random set (up to 10 cards).
   The student flips a card, then chooses "Got it" or "Again". "Again" cards come back before the student
   moves on to anything else, and the step is complete when every card in the set is "Got it".
   Cards are arrays: [front, meaning, icon, back]. */
var flashcardSet = {
  size: 10,
  cards: [], got: new Set(), flipped: new Set(), index: 0, lastLevel: null, config: null,
  init(config) {
    const self = this;
    self.config = config;
    const $ = s => document.querySelector(s);
    const original = window.renderCards;
    window.renderCards = function () { original(); self.render(); };
    new MutationObserver(() => {
      const card = self.cards[self.index];
      if (card && $('#flashcard').classList.contains('flipped')) { self.flipped.add(card[0]); self.updateButtons(); }
    }).observe($('#flashcard'), { attributes: true, attributeFilter: ['class'] });
    $('#gotCard').onclick = () => {
      self.got.add(self.cards[self.index][0]);
      if (self.got.size >= self.cards.length) config.complete();
      self.index = self.nextUnfinished();
      self.render();
    };
    $('#againCard').onclick = () => {
      self.flipped.delete(self.cards[self.index][0]);
      self.index = self.nextUnfinished();
      self.render();
    };
    $('#prevCard').onclick = () => self.move(-1);
    $('#nextCard').onclick = () => self.move(1);
    $('#newCards').onclick = () => { self.newSet(); self.render(); };
    self.render();
  },
  newSet() {
    const pool = this.config.cards().slice();
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    this.cards = pool.slice(0, Math.min(this.size, pool.length));
    this.got = new Set(); this.flipped = new Set(); this.index = 0;
  },
  nextUnfinished() {
    const n = this.cards.length;
    for (let k = 1; k <= n; k++) { const i = (this.index + k) % n; if (!this.got.has(this.cards[i][0])) return i; }
    return this.index;
  },
  move(step) { this.index = (this.index + step + this.cards.length) % this.cards.length; this.render(); },
  progress() { return { got: this.got.size, total: this.cards.length }; },
  updateButtons() {
    const card = this.cards[this.index];
    const ok = !!card && this.flipped.has(card[0]) && !this.got.has(card[0]);
    document.querySelector('#gotCard').disabled = !ok;
    document.querySelector('#againCard').disabled = !ok;
  },
  render() {
    const $ = s => document.querySelector(s);
    const level = this.config.level();
    if (!this.cards.length || level !== this.lastLevel) { this.lastLevel = level; this.newSet(); }
    if (this.index >= this.cards.length) this.index = 0;
    const v = this.cards[this.index], n = this.cards.length, ca = level === 'insecure';
    $('#flashcard').classList.remove('flipped');
    $('#cardIcon').textContent = v[2];
    $('#cardFront').textContent = v[0];
    $('#cardBack').textContent = v[3];
    $('#cardMeaning').textContent = v[1];
    const known = this.got.has(v[0]);
    $('#cardCounter').textContent = ca
      ? 'Targeta ' + (this.index + 1) + ' de ' + n + ' · ' + (known ? '✓ Sabuda' : 'Practicant') + ' · ' + this.got.size + '/' + n + ' sabudes'
      : 'Card ' + (this.index + 1) + ' of ' + n + ' · ' + (known ? '✓ Known' : 'Practising') + ' · ' + this.got.size + '/' + n + ' known';
    const left = n - this.got.size;
    $('#cardNote').textContent = left === 0
      ? (ca ? 'Has repassat les ' + n + ' targetes ✓ Ja pots marcar la secció com a feta.' : 'You have reviewed all ' + n + ' cards ✓ You can now mark the section as done.')
      : this.config.isDone() ? (ca ? 'Aquest pas ja està fet ✓ Pots tornar a practicar amb «Nou conjunt».' : 'This step is already done ✓ Use “New set” to practise again.')
      : (ca ? 'Gira la targeta per veure el significat i tria «Ho sé» o «Un altre cop». Les targetes de «Un altre cop» tornen abans de veure’n d’altres. Falten ' + left + ' de ' + n + '.'
            : 'Flip the card to check the meaning, then choose “Got it” or “Again”. Cards marked “Again” come back before you move on. ' + left + ' of ' + n + ' to go.');
    $('#gotCard').textContent = ca ? 'Ho sé ✓' : 'Got it ✓';
    $('#againCard').textContent = ca ? 'Un altre cop ↻' : 'Again ↻';
    $('#newCards').textContent = ca ? 'Nou conjunt ↻' : 'New set ↻';
    this.updateButtons();
  }
};
