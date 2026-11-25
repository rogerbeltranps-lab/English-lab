/* Towards Nativeness · 🧠 My flashcards (Roger, 25 Nov 2026: "I want to have Toward American Nativeness Flashcards too"). Roger's own
   flashcards page (flashcards.html, opened from the Towards Nativeness home), like the students' 🧠 Flashcards but built from his own
   course: spaced repetition, 📊 statistics and a ⚡ streak (shared/js/el-flashdeck.js). Never on a student page.

   Decks, built from the course's own data files, so every new list or step adds its cards by itself:
   - ✍ My slips: every item of TN_MISTAKES (his sentence with the wrong part → the natural sentence and why), one part per list, plus
     the lists' ✨ Make it idiomatic, 🗣 Spoken English and Catalan → English items. Prepositions-only lists are left out (they are 📍).
   - 📍 My prepositions: TN_PREP_CARDS (data/my-latest-mistakes.js), the same deck and progress as the 🧠 Preposition flashcards step.
   - LP1 to LP4: each learning path's Vocabulary (a part per group, Catalan ⇄ English), 🔍 Spot the mistake, Catalan → English, Grammar
     and ✨ Make it idiomatic.
   The page loads the four learning path files and my-latest-mistakes.js first (each one sets window.LP; the page keeps them in
   window.TN_LPS) and then this file. Progress: localStorage tnFlash (a tn… key, so it follows Roger's account, el-cloud.js).
   Voice: Kokoro Heart (tools/voice/harvest.js reads TN_FLASH_DECKS). */
(function (root) {
  const esc = x => String(x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const plain = x => String(x || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  const key = x => plain(x).toLowerCase().slice(0, 120);
  const GAP = /_{2,}/g;
  const QW = /^(why|what|how|when|where|who|whose|which|do|does|did|is|are|was|were|can|could|would|will|should|have|has|shall)\b/i;
  // an answer typed without its full stop gets one back on the card (a question gets ?)
  const dot = a => { a = String(a).trim(); return /[.?!…”"’)]$/.test(a) || !/^[A-Z“"‘]/.test(a) ? a : a + (QW.test(a) ? '?' : '.'); };
  const why = x => x ? '<div class="elfd-why">💡 ' + x + '</div>' : '';   // x is our own html (<strong>, <em>) from the data files
  const ans = x => '<div class="elfd-ans">' + x + '</div>';
  const hint = x => '<small class="tnf-hint">' + x + '</small>';
  const fixArr = m => Array.isArray(m.fix) ? m.fix : [m.fix];

  // his sentence, the wrong part shown, → the natural sentence with the fix marked
  function slip(m, part, pre) {
    const f = fixArr(m)[0], i = m.s.indexOf(m.bad), a = i >= 0 ? m.s.slice(0, i) : m.s, b = i >= 0 ? m.s.slice(i + m.bad.length) : '';
    return { id: pre + key(m.s), kind: 'g', part, say: i >= 0 ? a + f + b : m.s,
      front: hint('Say it the natural way') + esc(a) + (i >= 0 ? '<em>' + esc(m.bad) + '</em>' : '') + esc(b),
      back: ans(i >= 0 ? esc(a) + '<mark>' + esc(f) + '</mark>' + esc(b) : esc(m.s)) + why(m.why) };
  }
  // a whole sentence to say better (Spot the mistake, Make it idiomatic, Spoken English): his version → the first natural one
  const better = (it, part, pre, kind, h) => ({ id: pre + key(it.s), kind: kind || 'e', part, say: plain(it.a[0]),
    front: hint(h || 'Say it the natural way') + esc(it.s), back: ans(esc(it.a[0])) + why(it.why || it.ex) });
  // Catalan → English
  const catEn = (it, part, pre) => { const a = Array.isArray(it.a) ? it.a[0] : it.a;
    return { id: pre + key(it.q), kind: 'e', part, say: dot(plain(a)), front: hint('Say it in English') + esc(plain(it.q)), back: ans(esc(dot(a))) + why(esc(it.en || '')) }; };
  // a typed question: the gaps filled with the answer, or the question → the answer
  function typed(it, part, pre) {
    const q = plain(it.q), n = (q.match(GAP) || []).length, a0 = String(it.a[0]);
    if (n) {
      const w = a0.split(/\s*\/\s*|\s+/); let k = 0;
      const fill = mk => q.replace(GAP, () => mk(n > 1 ? w[k++] || '' : a0)).replace(/\s*\([^)]*\)/g, '').replace(/\s+([.,?!])/g, '$1');
      return { id: pre + key(it.q), kind: 'g', part, front: esc(q).replace(GAP, '<span class="elfd-gap"></span>'), say: fill(x => x),
        back: ans(esc(fill(x => '\u0001' + x + '\u0002')).replace(/\u0001/g, '<mark>').replace(/\u0002/g, '</mark>')) + why(esc(it.en || '')) };
    }
    return { id: pre + key(it.q), kind: 'g', part, front: esc(q), say: dot(a0), back: ans(esc(dot(a0))) + why(esc(it.en || '')) };
  }
  const vocab = (w, part, pre) => ({ id: pre + key(w[0]), kind: 'v', part, front: esc(w[0]), en: w[0], ca: w[1] || '', ex: w[2] || '', say: w[0].replace(/\s*\([^)]*\)/g, ''),
    back: ans(esc(w[1] || '')) + (w[2] ? '<div class="elfd-ex">' + esc(w[2]) + '</div>' : '') });

  function lpDeck(lp) {
    const P = id => (lp.panels || []).find(p => p.id === id), cards = [], pre = lp.key + ':';
    const v = P('vocab'); if (v) (Array.isArray(v.groups) ? v.groups : []).forEach(g => (g.items || []).forEach(w => cards.push(vocab(w, 'Vocabulary: ' + g.g, pre + 'v:'))));
    const s = P('spotw'); if (s) s.items.forEach(it => cards.push(better(it, '🔍 My mistakes', pre + 's:', 'g')));
    const c = P('translate'); if (c) c.items.forEach(it => cards.push(catEn(it, 'Catalan → English', pre + 'c:')));
    const g = P('grammar'); if (g) g.items.forEach(it => cards.push(typed(it, 'Grammar', pre + 'g:')));
    const i = P('idiom'); if (i) i.items.forEach(it => cards.push(better(it, '✨ Make it idiomatic', pre + 'i:')));
    return { id: 'tn-lp' + lp.n, name: 'LP' + lp.n + ' · ' + lp.title, cards: uniq(cards) };
  }
  const uniq = cs => { const seen = new Set(); return cs.filter(c => !seen.has(c.id) && seen.add(c.id)); };

  function slipsDeck() {
    const B = (root.TN_MISTAKES || []).filter(b => !/preposition/i.test(b.date)), cards = [];
    B.forEach(b => b.items.forEach(m => cards.push(slip(m, 'Your messages · ' + b.date.split(' · ')[0], 'm:'))));
    B.forEach(b => (b.idiom || []).forEach(it => cards.push(better(it, '✨ Make it idiomatic', 'mi:'))));
    B.forEach(b => (b.spoken || []).forEach(it => cards.push(better(it, '🗣 Spoken English', 'ms:', 'e', 'Say it the way you would in a chat'))));
    B.forEach(b => b.items.filter(m => m.ca && m.en).forEach(m => cards.push(catEn({ q: m.ca, a: m.en, en: plain(m.why) }, 'Catalan → English', 'mc:'))));
    return { id: 'tn-slips', name: '✍ My slips', cards: uniq(cards) };
  }

  /* 🔊 The cards' voice: Chris (ElevenLabs, like the 🗣 Shadowing) where tools/towards-nativeness/cards-eleven.mjs has recorded the line
     (audio/cards/<key>.mp3, listed in audio/cards/index.js as TN_CARD_VOICE; Roger, 25 Nov 2026: "use eleven labs for the flashcards
     too"), otherwise Kokoro Heart (ELVoice, audio/voice/). key = ELVoice.key of the text, as for Kokoro. */
  let tnAudio = null;
  const here = typeof document === 'undefined' ? 'http://x/4eso/towards-nativeness/data/' : (document.currentScript && document.currentScript.src) || location.href;   // tools/voice/harvest.js runs it in Node
  const cardsBase = new URL('../audio/cards/', here).href;
  root.TN_SAY = x => {
    const V = root.ELVoice, list = (Array.isArray(x) ? x : [x]).filter(t => plain(t)), have = root.TN_CARD_VOICE;
    if (tnAudio) { tnAudio.pause(); tnAudio = null; }
    if (!V) return;
    if (!have || !list.length || !list.every(t => have.has(V.key(t)))) { V.say(list); return; }
    V.stop(); let i = 0;
    const go = () => { if (i >= list.length) return; const a = new Audio(cardsBase + V.key(list[i++]) + '.mp3'); tnAudio = a;
      a.onended = () => { if (tnAudio === a) setTimeout(() => tnAudio === a && go(), 350); }; a.onerror = () => { if (tnAudio === a) { tnAudio = null; V.say(list.slice(i - 1)); } }; a.play().catch(() => {}); };
    go();
  };

  root.TN_FLASH_DECKS = () => [slipsDeck(), { id: 'tn-prepositions', name: '📍 My prepositions', cards: root.TN_PREP_CARDS || [] }]
    .concat((root.TN_LPS || []).filter(lp => lp && lp.n < 5).sort((a, b) => a.n - b.n).map(lpDeck))
    .filter(d => d.cards.length);
})(window);
