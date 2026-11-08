/* 🔊 Voice for the flashcards (Roger, 7 Nov 2026: "I want Heart, American English, and all the flashcards of everywhere to have audio").
   Every flashcard word and example on the site is recorded with Kokoro (free, open source, Apache 2.0), voice af_heart (American English),
   by tools/voice (harvest.js → generate.py) as audio/voice/<key>.mp3; audio/voice/index.js lists the recorded keys (window.EL_VOICE).
   key = FNV-1a of the text as shown (ELVoice.norm). A text with no recording (a card a student adds, a new LS before tools/voice runs
   again) uses the browser's American English voice.
   On any page with a #flashcard (LS1 and LS2 Learning Paths, Getting started) a 🔊 Listen button (the English word) and a 🔊 Example
   button (once the card is turned) appear under the card. lab/practice.html and flashcards/ call ELVoice.say themselves.
   Loaded by learning-path-support.js on the Learning Path pages, and by a <script> tag elsewhere. */
(function (root) {
  const norm = s => String(s == null ? '' : s).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
  const key = s => { let h = 0x811c9dc5; s = norm(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return ('0000000' + h.toString(16)).slice(-8); };
  // what the voice reads: "win / lose a match" → "win, lose a match"; (be) good at → be good at; get up at (time) → get up at;
  // I love + -ing → I love doing; sb / sth → somebody / something; no emoji
  const speakable = s => norm(s)
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '')
    .replace(/\bsb\b\.?/g, 'somebody').replace(/\bsth\b\.?/g, 'something')
    .replace(/\s*\+\s*-ing\b/g, ' doing').replace(/(?!^)\s*\([^)]*\)/g, '').replace(/\s*\/\s*/g, ', ').replace(/[()[\]]/g, '').replace(/\s\+\s/g, ', ').replace(/_{2,}/g, ', ').replace(/…|\.\.\./g, ', ')
    .replace(/\s*,\s*(,\s*)+/g, ', ').replace(/([!?.]),/g, '$1').replace(/^[\s,]+|[\s,]+$/g, '').replace(/\s+/g, ' ').trim();
  const api = { norm, key, speakable };
  if (typeof module === 'object' && module.exports) { module.exports = api; return; }   // tools/voice/harvest.js

  const me = document.currentScript && document.currentScript.src;
  const base = me ? new URL('../../audio/voice/', me).href : '/audio/voice/';
  if (!root.EL_VOICE && !document.querySelector('script[data-el-voice]')) {
    const t = document.createElement('script'); t.src = base + 'index.js'; t.dataset.elVoice = '1'; document.head.appendChild(t);
  }
  let audio = null;
  function stop() { tok++; if (audio) { audio.pause(); audio = null; } try { root.speechSynthesis && speechSynthesis.cancel(); } catch (e) {} }
  let tok = 0;
  function browser(text, rate, done) {
    const s = root.speechSynthesis; if (!s) return done && done();
    const u = new SpeechSynthesisUtterance(speakable(text)), vs = s.getVoices();
    const v = vs.find(x => /^en(-|_)US/i.test(x.lang) && /samantha|google us|natural|aria|jenny/i.test(x.name)) || vs.find(x => /^en(-|_)US/i.test(x.lang)) || vs.find(x => /^en(-|_)/i.test(x.lang));
    u.lang = 'en-US'; if (v) u.voice = v; u.rate = rate || 0.95; if (done) u.onend = done; s.speak(u);
  }
  function one(text, rate, me, done) {
    if (me !== tok) return;
    const k = key(text), next = () => { if (me === tok && done) setTimeout(() => me === tok && done(), 350); };
    if (root.EL_VOICE && root.EL_VOICE.has(k)) {
      const a = new Audio(base + k + '.mp3'); audio = a;
      if (rate && rate < 0.9) { a.playbackRate = rate / 0.9; a.preservesPitch = true; }
      a.onended = next;
      a.onerror = () => { if (audio === a) { audio = null; browser(text, rate, next); } };
      a.play().catch(() => {});
      return;
    }
    browser(text, rate, next);
  }
  api.has = text => !!(root.EL_VOICE && root.EL_VOICE.has(key(text)));
  // say(text) or say([word, example]): one after the other; a newer call stops an older one
  api.say = function (text, rate) {
    const list = (Array.isArray(text) ? text : [text]).filter(t => norm(t));
    stop(); const me = ++tok; let i = 0;
    const go = () => { if (i < list.length) one(list[i++], rate, me, go); };
    go();
  };
  api.stop = stop;

  /* Flashcards: the English word and example of the card on screen.
     flashcard-set.js cards are [front, meaning, icon, example]; in "Català → English" (pressed data-dir="ca") the English is the meaning.
     Older LS1 pages fill #cardFront (expression) and #cardHint (example) themselves. */
  function current() {
    const fs = root.flashcardSet, txt = s => { const n = document.querySelector(s); return n ? n.textContent : ''; };
    if (fs && fs.config && fs.cards && fs.cards[fs.index]) {
      const v = fs.cards[fs.index], caDir = document.querySelector('.dir-toggle [data-dir="ca"][aria-pressed="true"]');
      return { word: caDir ? v[1] : v[0], ex: v[3] || '' };
    }
    return { word: txt('#cardFront'), ex: txt('#cardHint') };
  }
  function css() {
    if (document.getElementById('el-voice-css')) return;
    const st = document.createElement('style'); st.id = 'el-voice-css';
    st.textContent = '.el-voice-row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:10px 0 2px}.el-voice-row button{font:inherit;font-weight:700;font-size:.95rem;border:0;border-radius:999px;padding:7px 16px;background:#eaf0ff;color:#2a4bd7;cursor:pointer}.el-voice-row button:hover{background:#dce6ff}.el-voice-row button[hidden]{display:none}';
    document.head.appendChild(st);
  }
  function attach(card) {
    if (card.dataset.elVoice) return; card.dataset.elVoice = '1'; css();
    const row = document.createElement('div'); row.className = 'el-voice-row';
    const ca = () => /^(insecure|beginners)$/.test(String(root.level || (document.querySelector('.route.active') || {}).dataset?.level || ''));
    row.innerHTML = '<button type="button" data-v="word"></button><button type="button" data-v="ex" hidden></button>';
    const [bw, be] = row.querySelectorAll('button');
    const label = () => { bw.textContent = '🔊 ' + (ca() ? 'Escolta' : 'Listen'); be.textContent = '🔊 ' + (ca() ? 'Exemple' : 'Example'); };
    // turning the card over plays the word and then the example (Roger, 7 Nov 2026: "when we turn a flashcard we hear the audio")
    let was = card.classList.contains('flipped');
    const sync = () => { label(); const c = current(), on = card.classList.contains('flipped'); be.hidden = !(on && norm(c.ex));
      if (on && !was) setTimeout(() => { const c2 = current(); api.say([c2.word, c2.ex]); }, 0);
      if (!on && was) stop(); was = on; };
    bw.onclick = e => { e.stopPropagation(); api.say(current().word); };
    be.onclick = e => { e.stopPropagation(); api.say(current().ex); };
    card.insertAdjacentElement('afterend', row); sync();
    new MutationObserver(sync).observe(card, { attributes: true, attributeFilter: ['class'], subtree: true, childList: true, characterData: true });
  }
  function scan() { document.querySelectorAll('.flashcard#flashcard, #flashcard').forEach(attach); }
  api.scan = scan;
  root.ELVoice = api;
  const go = () => { scan(); new MutationObserver(scan).observe(document.body, { childList: true, subtree: true }); };
  if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
})(typeof window !== 'undefined' ? window : globalThis);
